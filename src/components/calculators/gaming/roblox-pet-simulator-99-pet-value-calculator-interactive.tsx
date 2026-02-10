'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LineChart, ArrowUpRight, ArrowDownRight, Briefcase, BookOpen, BrainCircuit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
    petTier: z.enum(['exclusive', 'huge', 'titanic']),
    quantity: z.number().min(1).default(1),
    rapPerUnit: z.number().min(0).default(500000), // 500k
    inflationTrend: z.enum(['deflation', 'stable', 'inflation', 'hyperinflation']),
    marketState: z.enum(['panic_sell', 'normal', 'hype']),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    totalPortfolioValue: string;
    inflationAdjustedValue: string;
    trendIcon: 'up' | 'down' | 'stable';
    advice: string;
    liquidityRating: string;
};

const calculatePS99Value = (values: FormValues): ResultPayload => {
    const rawTotal = values.quantity * values.rapPerUnit;

    // Trend logic
    // Inflation means gems are worth LESS, so Pet Prices go UP (Number goes up, buying power stays same)
    // Deflation means gems are worth MORE, so Pet Prices go DOWN.

    let projectionMult = 1.0;
    if (values.inflationTrend === 'hyperinflation') projectionMult = 1.5; // Expect +50% rise
    if (values.inflationTrend === 'inflation') projectionMult = 1.1;
    if (values.inflationTrend === 'deflation') projectionMult = 0.8; // Expect drop

    // Market Hype logic
    if (values.marketState === 'panic_sell') projectionMult -= 0.2;
    if (values.marketState === 'hype') projectionMult += 0.2;

    const projectedVal = rawTotal * projectionMult;

    // Advice
    let advice = "HOLD";
    let trend: 'up' | 'down' | 'stable' = 'stable';

    if (projectionMult > 1.1) {
        advice = "BUY / HOLD (Value Raising)";
        trend = 'up';
    } else if (projectionMult < 0.9) {
        advice = "SELL NOW (Value Dropping)";
        trend = 'down';
    }

    // Liquidity Rating (How hard is it to sell?)
    // Titanics = Hard (High value), Huges = Easy (Currency), Exclusives = Medium
    let liquidity = "High (Easy to sell)";
    if (values.petTier === 'titanic') liquidity = "Low (Niche Buyers)";
    if (values.petTier === 'exclusive' && values.marketState === 'panic_sell') liquidity = "Very Low (Nobody buying)";

    return {
        totalPortfolioValue: formatNumber(rawTotal),
        inflationAdjustedValue: formatNumber(projectedVal),
        trendIcon: trend,
        advice,
        liquidityRating: liquidity,
    };
};

function formatNumber(num: number): string {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + " B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + " M";
    if (num >= 1e3) return (num / 1e3).toFixed(2) + " k";
    return num.toLocaleString();
}

export default function RobloxPS99ValueCalcInteractive() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            petTier: 'huge',
            quantity: 10,
            rapPerUnit: 6000000,
            inflationTrend: 'inflation',
            marketState: 'normal',
        },
    });

    const onSubmit = (values: FormValues) => {
        setResult(calculatePS99Value(values));
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Portfolio Assets</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="petTier"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Asset Tier</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="exclusive">Exclusive / Event</SelectItem>
                                                    <SelectItem value="huge">Huge Pet</SelectItem>
                                                    <SelectItem value="titanic">Titanic Pet</SelectItem>
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
                                            <FormLabel>Quantity Owned</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="rapPerUnit"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Current RAP (Per Unit)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                            </FormControl>
                                            <FormDescription>Check in-game rap.</FormDescription>
                                        </FormItem>
                                    )}
                                />
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="inflationTrend"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Economy Trend</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="deflation">Deflation (Prices Dropping)</SelectItem>
                                                        <SelectItem value="stable">Stable</SelectItem>
                                                        <SelectItem value="inflation">Inflation (Prices Rising)</SelectItem>
                                                        <SelectItem value="hyperinflation">Hyperinflation (Rapid Rise)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="marketState"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Market Sentiment</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="panic_sell">Fear / Panic Selling</SelectItem>
                                                        <SelectItem value="normal">Normal</SelectItem>
                                                        <SelectItem value="hype">Hype / Update Frenzy</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 font-bold text-white">
                                CALCULATE PORTFOLIO
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result ? (
                <div className="animate-in slide-in-from-top-4 duration-500 fade-in">
                    <Card className="bg-slate-950 text-white border-slate-800 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/40 to-cyan-600/10 animate-pulse"></div>
                        <CardHeader className="relative pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Financial Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-slate-400 text-xs uppercase tracking-wider">Current Net Worth</h4>
                                    <p className="text-3xl font-black text-white">{result.totalPortfolioValue} <span className="text-sm font-normal text-teal-400">Gems</span></p>

                                    <h4 className="text-slate-400 text-xs uppercase tracking-wider mt-4">Projected Value (Trend)</h4>
                                    <div className="flex items-center gap-2">
                                        <p className="text-2xl font-bold text-teal-200">{result.inflationAdjustedValue}</p>
                                        {result.trendIcon === 'up' && <ArrowUpRight className="text-green-500 h-5 w-5" />}
                                        {result.trendIcon === 'down' && <ArrowDownRight className="text-red-500 h-5 w-5" />}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 flex flex-col justify-center">
                                <div className="p-4 border border-white/10 bg-white/5 rounded-xl text-center">
                                    <p className="text-slate-400 text-sm mb-1">STRATEGY</p>
                                    <p className="text-xl font-bold text-white">{result.advice}</p>
                                    <p className="text-xs text-slate-500 mt-2">Liquidity: {result.liquidityRating}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="flex items-center justify-center p-8 text-muted-foreground bg-muted/10 border-2 border-dashed rounded-xl">
                    <div className="text-center space-y-4 max-w-sm">
                        <LineChart className="w-16 h-16 mx-auto opacity-20" />
                        <h3 className="text-lg font-semibold">Ready to Analyze</h3>
                        <p>Input your assets to see if you are protected against inflation.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <BookOpen className="h-5 w-5 text-teal-500" />
                            Understanding the Inputs
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p><strong>Economy Trend:</strong> This is the key variable. Inflation means your gems lose value (so buy pets). Deflation means pets lose value (so sell for gems).</p>
                        <p><strong>RAP Per Unit:</strong> The current average price. Multiply this by your Quantity to get total portfolio value.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <BrainCircuit className="h-5 w-5 text-teal-500" />
                            Formula Used
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p><strong>Projection:</strong></p>
                        <code className="bg-muted px-2 py-1 rounded block w-fit">Value = (RAP &times; Quantity) &times; Inflation_Index</code>
                        <p>We apply a +10% to +50% markup for inflation scenarios to predict future value.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
