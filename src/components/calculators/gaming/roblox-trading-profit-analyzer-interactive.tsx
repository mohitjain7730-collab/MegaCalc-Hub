'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    TrendingUp,
    AlertTriangle,
    BadgeCheck,
    ArrowRightLeft,
    BookOpen,
    BrainCircuit
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
    buyPrice: z.number({ invalid_type_error: 'Enter buy price' }).min(0, "Price cannot be negative"),
    sellPrice: z.number({ invalid_type_error: 'Enter sell price' }).min(0, "Price cannot be negative"),
    tradingFee: z.number({ invalid_type_error: 'Enter fee %' }).min(0).max(100).default(30),
    holdingPeriod: z.number({ invalid_type_error: 'Enter days' }).min(0).default(0),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    grossProfit: string;
    taxPaid: string;
    netProfit: string;
    netProfitRaw: number;
    roi: string;
    roiRaw: number;
    dailyRoi: string;
    breakEven: string;
    status: 'loss' | 'break-even' | 'profit' | 'high-profit';
    interpretation: string;
    recommendations: string[];
    plan: { label: string; detail: string }[];
};

function formatNumber(num: number): string {
    return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

const calculateResult = (values: FormValues): ResultPayload => {
    const { buyPrice, sellPrice, tradingFee, holdingPeriod } = values;

    const grossProfit = sellPrice - buyPrice;
    const taxAmount = Math.floor(sellPrice * (tradingFee / 100));
    const netProfit = sellPrice - taxAmount - buyPrice;

    const roi = buyPrice > 0 ? (netProfit / buyPrice) * 100 : 0;
    const dailyRoi = holdingPeriod > 0 ? roi / holdingPeriod : roi; // If 0 days, assumes instant flip

    const breakEvenSellPrice = Math.ceil(buyPrice / (1 - (tradingFee / 100)));

    let status: ResultPayload['status'] = 'break-even';
    let interpretation = '';

    if (netProfit < 0) {
        status = 'loss';
        interpretation = `You are losing ${formatNumber(Math.abs(netProfit))} Robux. The 30% tax is eating your margin.`;
    } else if (netProfit === 0) {
        status = 'break-even';
        interpretation = 'You broke even. No profit, but at least you didn\'t lose value.';
    } else if (roi > 40) {
        status = 'high-profit';
        interpretation = 'Excellent Flip! You are beating the market comfortably.';
    } else {
        status = 'profit';
        interpretation = 'Solid profitable trade. Keep compounding these gains.';
    }

    const recommendations = [
        `Tax Hit: -${formatNumber(taxAmount)} Robux went to Roblox fees.`,
        `Break-Even: You needed to sell at ${formatNumber(breakEvenSellPrice)} to profit.`,
        `Efficiency: Your gross profit was ${formatNumber(grossProfit)}, but tax took ${(taxAmount / (grossProfit || 1) * 100).toFixed(0)}% of it.`,
        `Compound Power: Doing this trade 10 times would turn ${formatNumber(buyPrice)} into ${formatNumber(buyPrice * Math.pow(1 + (roi / 100), 10))}.`
    ];

    const plan = [
        {
            label: 'Immediate',
            detail: netProfit > 0 ? 'Secure the profit. Reinvest into higher liquidity items.' : 'Do not sell yet. Wait for inflation or demand spike.'
        },
        {
            label: 'Strategy',
            detail: roi < 20 ? 'Too risky for low reward. Aim for 30%+ margins to be safe from crash.' : 'Great margin. Scable strategy.'
        }
    ];

    return {
        grossProfit: formatNumber(grossProfit),
        taxPaid: formatNumber(taxAmount),
        netProfit: formatNumber(netProfit),
        netProfitRaw: netProfit,
        roi: roi.toFixed(2) + '%',
        roiRaw: roi,
        dailyRoi: dailyRoi.toFixed(2) + '%',
        breakEven: formatNumber(breakEvenSellPrice),
        status,
        interpretation,
        recommendations,
        plan
    };
};

export default function RobloxTradingProfitAnalyzerInteractive() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            buyPrice: 1000,
            sellPrice: 1500,
            tradingFee: 30, // Standard Roblox Tax
            holdingPeriod: 0,
        },
    });

    const onSubmit = (values: FormValues) => {
        setResult(calculateResult(values));
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Trade Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="buyPrice"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-emerald-600 font-bold">Buy Price (Robux)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} className="bg-emerald-500/5 border-emerald-200 focus:border-emerald-500" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="sellPrice"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-blue-600 font-bold">Sell Price (Robux)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} className="bg-blue-500/5 border-blue-200 focus:border-blue-500" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="tradingFee"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Roblox Tax %</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                                            </FormControl>
                                            <FormDescription className="text-xs">
                                                Limiteds are always 30%.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="holdingPeriod"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Days Held (Optional)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                                            </FormControl>
                                            <FormDescription className="text-xs">
                                                Calculates daily efficiency.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 font-bold text-white shadow-lg">
                                CALCULATE NET PROFIT
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result ? (
                <div className="animate-in slide-in-from-top-4 duration-500 fade-in">
                    <Card className={`bg-slate-950 text-white border-slate-800 relative overflow-hidden ${result.netProfitRaw < 0 ? 'border-red-900/50' : 'border-emerald-900/50'}`}>
                        <div className={`absolute inset-0 bg-gradient-to-r ${result.netProfitRaw < 0 ? 'from-red-900/20 to-orange-900/10' : 'from-emerald-900/20 to-teal-900/10'} animate-pulse`}></div>
                        <CardHeader className="relative pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Financial Result</CardTitle>
                        </CardHeader>
                        <CardContent className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-slate-400 text-xs uppercase tracking-wider">Net Profit (Post-Tax)</h4>
                                <p className={`text-4xl font-black tracking-tight ${result.netProfitRaw < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                    {result.netProfitRaw > 0 ? '+' : ''}{result.netProfit} R$
                                </p>
                                <p className="text-sm text-slate-400 mt-1 font-medium flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" /> ROI: <span className="text-white">{result.roi}</span>
                                </p>

                                <div className="mt-6 space-y-2">
                                    {result.recommendations.map((rec, i) => (
                                        <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 shrink-0" />
                                            <span>{rec}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4 flex flex-col justify-center">
                                <div className="p-4 border border-white/10 bg-white/5 rounded-xl">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-bold text-white text-sm">Break-Even Sell Price</h4>
                                        <BadgeCheck className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <p className="text-2xl font-bold text-white">{result.breakEven} R$</p>
                                    <p className="text-xs text-slate-400 mt-1">Selling below this is a loss.</p>
                                </div>
                                <div className="p-4 border border-white/10 bg-white/5 rounded-xl">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-bold text-white text-sm">Tax Paid</h4>
                                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                                    </div>
                                    <p className="text-xl font-bold text-white">{result.taxPaid} R$</p>
                                    <p className="text-xs text-slate-400 mt-1">Lost to the void.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="flex items-center justify-center p-12 text-muted-foreground bg-muted/10 border-2 border-dashed rounded-xl">
                    <div className="text-center space-y-4 max-w-sm">
                        <ArrowRightLeft className="w-16 h-16 mx-auto opacity-20" />
                        <h3 className="text-lg font-semibold">Calculator Ready</h3>
                        <p>Input your buy and sell targets to see if the trade survives the 30% tax.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <BookOpen className="h-5 w-5 text-emerald-600" />
                            The 30% Rule
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-muted-foreground">
                        <p><strong>Limiters:</strong> Every time you sell a Limited item, Roblox takes 30%.</p>
                        <p><strong>Example:</strong> Sell for 1000 &rarr; You get 700.</p>
                        <p><strong>Impact:</strong> To make even 1 Robux of profit, you must sell for at least <strong> ~1.43x</strong> your buy price.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <BrainCircuit className="h-5 w-5 text-emerald-600" />
                            Profit Formula
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p><strong>Net Calculation:</strong></p>
                        <code className="bg-muted px-2 py-1 rounded block w-fit">Profit = (Sell &times; 0.70) - Buy</code>
                        <p>We calculate the exact floor values used by Roblox's rounding system to ensure accuracy.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
