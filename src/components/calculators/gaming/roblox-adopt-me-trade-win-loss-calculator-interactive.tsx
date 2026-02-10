'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TrendingUp, TrendingDown, AlertTriangle, ShieldCheck, Scale } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Constants
const DEMAND_MULTIPLIERS = {
    'high': 1.1, // High demand pets are worth 10% more in "real" value
    'normal': 1.0,
    'low': 0.9,  // Low demand (htt) pets are worth 10% less
};

const formSchema = z.object({
    yourValue: z.number().min(0, "Value must be positive"),
    theirValue: z.number().min(0, "Value must be positive"),
    yourDemand: z.enum(['high', 'normal', 'low']).default('normal'),
    theirDemand: z.enum(['high', 'normal', 'low']).default('normal'),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    verdict: string; // Big Win, Small Win, Fair, Small Loss, Big Loss
    percentageDiff: string;
    valueDiff: number;
    riskAnalysis: string;
    verdictColor: string;
    description: string;
};

const calculateWinLoss = (values: FormValues): ResultPayload => {
    // Apply demand modifiers
    const adjustedYou = values.yourValue * DEMAND_MULTIPLIERS[values.yourDemand as keyof typeof DEMAND_MULTIPLIERS];
    const adjustedThem = values.theirValue * DEMAND_MULTIPLIERS[values.theirDemand as keyof typeof DEMAND_MULTIPLIERS];

    const diff = adjustedThem - adjustedYou;
    const percentage = adjustedYou > 0 ? (diff / adjustedYou) * 100 : 0;

    let verdict = "Fair";
    let color = "text-yellow-500";
    let desc = "This trade is perfectly balanced.";
    let risk = "Low Risk. Safe trade.";

    if (percentage > 20) {
        verdict = "Big Win (BW)";
        color = "text-green-500";
        desc = "You are gaining significant value. Accept immediately!";
        risk = "Watch out for switch scams (they might remove the good pet).";
    } else if (percentage > 5) {
        verdict = "Small Win (SW)";
        color = "text-green-400";
        desc = "A solid profit. A good trade to take.";
        risk = "Standard trade risk.";
    } else if (percentage >= -5) {
        verdict = "Fair (F)";
        color = "text-blue-400";
        desc = "Equal value. Do this if you prefer their pets.";
        risk = "Safe.";
    } else if (percentage > -20) {
        verdict = "Small Loss (SL)";
        color = "text-orange-400";
        desc = "You are overpaying slightly. Only do this for 'Happy Values'.";
        risk = "You are losing value.";
    } else {
        verdict = "Big Loss (BL)";
        color = "text-red-500";
        desc = "Do not do this trade! You are being sharked.";
        risk = "High Risk. Massive value loss.";
    }

    // Special case for nearly 0
    if (adjustedYou === 0 && adjustedThem === 0) {
        verdict = "No Value";
        color = "text-gray-500";
        desc = "Enter values to see results.";
    }

    return {
        verdict,
        percentageDiff: percentage.toFixed(1) + "%",
        valueDiff: parseFloat(diff.toFixed(2)),
        riskAnalysis: risk,
        verdictColor: color,
        description: desc
    };
};

export default function RobloxAdoptMeTradeWinLossInteractive() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            yourValue: 0,
            theirValue: 0,
            yourDemand: 'normal',
            theirDemand: 'normal',
        },
    });

    const onSubmit = (values: FormValues) => {
        setResult(calculateWinLoss(values));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Trade Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                                <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                                    <h4 className="font-semibold text-sm flex items-center gap-2 text-primary">
                                        <TrendingDown className="h-4 w-4" /> YOU Give
                                    </h4>
                                    <FormField
                                        control={form.control}
                                        name="yourValue"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Your Total Value</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="yourDemand"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Demand Level</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="high">High (Preppie/Exotic)</SelectItem>
                                                        <SelectItem value="normal">Normal</SelectItem>
                                                        <SelectItem value="low">Low (Hard to Trade)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                                    <h4 className="font-semibold text-sm flex items-center gap-2 text-primary">
                                        <TrendingUp className="h-4 w-4" /> THEY Give
                                    </h4>
                                    <FormField
                                        control={form.control}
                                        name="theirValue"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Their Total Value</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="theirDemand"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Demand Level</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="high">High (Preppie/Exotic)</SelectItem>
                                                        <SelectItem value="normal">Normal</SelectItem>
                                                        <SelectItem value="low">Low (Hard to Trade)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 font-bold">
                                    ANALYZE TRADE
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
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse"></div>
                            <CardHeader className="relative pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">Trade Verdict</CardTitle>
                            </CardHeader>
                            <CardContent className="relative">
                                <div className="flex flex-col md:flex-row md:items-baseline gap-4 mb-4">
                                    <span className={`text-4xl md:text-5xl font-black tracking-tight ${result.verdictColor}`}>
                                        {result.verdict}
                                    </span>
                                    <span className="text-xl text-slate-300">
                                        {result.valueDiff > 0 ? "+" : ""}{result.valueDiff} Value ({result.percentageDiff})
                                    </span>
                                </div>
                                <p className="text-lg font-medium text-white mb-2">
                                    {result.description}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-slate-400 mt-4 p-2 bg-white/5 rounded">
                                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                    <span>Risk Analysis: {result.riskAnalysis}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-blue-500" />
                                    Trading Safety Tip
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Always triple-check the second trade window. A common scam is the <strong>"Switch Glitch"</strong> or <strong>"Quick Switch"</strong> where a scammer swaps a Mega Neon for a regular Neon of the same pet at the last second. They look almost identical.
                                </p>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center p-8 text-muted-foreground bg-muted/10 border-2 border-dashed rounded-xl">
                        <div className="text-center space-y-4 max-w-sm">
                            <Scale className="w-16 h-16 mx-auto opacity-20" />
                            <h3 className="text-lg font-semibold">Ready to Analyze</h3>
                            <p>Enter the values from your favorite value list to get an impartial decision.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
