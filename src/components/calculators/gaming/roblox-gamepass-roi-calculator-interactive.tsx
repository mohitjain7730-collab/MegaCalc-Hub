'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Search,
    Zap,
    CheckCircle2,
    MinusCircle,
    Clock,
    TrendingUp,
    Activity,
    Calculator,
    Coins
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
    gamepassCost: z.number({ invalid_type_error: 'Enter cost' }).min(0, "Cost cannot be negative"),
    timeSavedPerDay: z.number({ invalid_type_error: 'Enter minutes' }).min(0).default(0),
    currencyEarnedPerDay: z.number({ invalid_type_error: 'Enter amount' }).min(0).default(0),
    hourlyWage: z.number().min(0).default(0), // "Value of your time"
    dailyGrindHours: z.number().min(0).max(24).default(1),
    boostMultiplier: z.number().min(1).default(1)
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    breakEvenHours: string;
    valueRate: string; // "High Value" or "Low Value"
    dailyVirtualEarnings: string;
    timeSavedTotal: string;
    effectiveHourlyWage: string;
    status: 'bad-deal' | 'fair' | 'good-deal' | 'must-buy';
    interpretation: string;
    recommendations: string[];
    plan: { label: string; detail: string }[];
    metrics: {
        cost: number;
        valueGenerated: number;
        roiPercent: number;
    };
};

function formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toLocaleString();
}

const calculateResult = (values: FormValues): ResultPayload => {
    const { gamepassCost, timeSavedPerDay, currencyEarnedPerDay, hourlyWage, dailyGrindHours, boostMultiplier } = values;

    // 1. Calculate Virtual Value (Currency)
    const baseEarnings = currencyEarnedPerDay * dailyGrindHours;
    const boostedEarnings = baseEarnings * boostMultiplier;
    const extraEarningsDelta = boostedEarnings - baseEarnings;

    // 2. Time Value
    const userTimeValue = hourlyWage > 0 ? hourlyWage : 100; // Robux per hour value
    const timeSavedHours = timeSavedPerDay / 60;
    const timeValueGenerated = timeSavedHours * userTimeValue;

    // 3. Total Daily Value
    const estimatedDaysPlayed = 30; // Standard month metric
    const totalPlayHours = dailyGrindHours * estimatedDaysPlayed;
    const costPerHour = gamepassCost / (totalPlayHours || 1);

    let status: ResultPayload['status'] = 'fair';
    let interpretation = '';

    if (costPerHour < 1) {
        status = 'must-buy';
        interpretation = 'Extremely cheap for the time you play.';
    } else if (costPerHour < 5) {
        status = 'good-deal';
        interpretation = 'Solid value if you play daily.';
    } else if (costPerHour < 20) {
        status = 'fair';
        interpretation = 'A luxury purchase. Only buy if you main this game.';
    } else {
        status = 'bad-deal';
        interpretation = 'Expensive. Only worth it for hardcore leaderboard grinding.';
    }

    // ROI Logic:
    const dailyValueRobux = timeValueGenerated + (extraEarningsDelta / 10000); // Very rough currency conversion 10k:1
    const daysToBreakEven = dailyValueRobux > 0 ? gamepassCost / dailyValueRobux : 999;

    const recommendations = [
        `Cost Efficiency: You are paying ${costPerHour.toFixed(1)} Robux for every hour you play this month.`,
        `Time Saved: This pass saves you ~${(timeSavedPerDay * 30 / 60).toFixed(1)} hours of walking/grinding per month.`,
        `Break-Even: At your pace, this pass "pays for itself" in utility after ${daysToBreakEven > 900 ? 'forever' : daysToBreakEven.toFixed(1) + ' days'}.`,
        `Boost Impact: Your daily income jumps from ${formatNumber(baseEarnings)} to ${formatNumber(boostedEarnings)}.`
    ];

    const plan = [
        {
            label: 'Verdict',
            detail: status === 'must-buy' ? 'Buy immediately. It saves too much time not to.' : status === 'bad-deal' ? 'Skip. You generally do not play enough to justify this cost.' : 'Buy if you plan to play for at least 2 more weeks.'
        },
        {
            label: 'Strategy',
            detail: `Pair this with pure grinding. The ${boostMultiplier}x multiplier scales best when you play long sessions (${dailyGrindHours}h+).`
        }
    ];

    return {
        breakEvenHours: daysToBreakEven.toFixed(1) + ' Days',
        valueRate: costPerHour < 5 ? 'High Value' : 'Luxury',
        dailyVirtualEarnings: formatNumber(boostedEarnings),
        timeSavedTotal: (timeSavedPerDay * 30 / 60).toFixed(1) + ' Hours',
        effectiveHourlyWage: formatNumber(extraEarningsDelta), // Extra currency per day
        status,
        interpretation,
        recommendations,
        plan,
        metrics: {
            cost: gamepassCost,
            valueGenerated: dailyValueRobux * 30,
            roiPercent: 0
        }
    };
};

export default function RobloxGamepassROICalculatorInteractive() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            gamepassCost: 499,
            dailyGrindHours: 1,
            currencyEarnedPerDay: 1000,
            timeSavedPerDay: 0,
            boostMultiplier: 1,
            hourlyWage: 0
        },
    });

    const onSubmit = (values: FormValues) => {
        setResult(calculateResult(values));
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><Search className="h-4 w-4" /> Gamepass Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="gamepassCost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold text-orange-600">Cost (Robux)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} className="bg-orange-500/5 border-orange-200" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="dailyGrindHours"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Daily Playtime (Hours)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.5" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                                            </FormControl>
                                            <FormDescription className="text-xs">Be honest!</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/30 rounded-lg">
                                    <div className="col-span-2 text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                        <Zap className="h-4 w-4" />
                                        Utility Features (Fill what applies)
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="boostMultiplier"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Multiplier (e.g. 2x Coins)</FormLabel>
                                                <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={field.value.toString()}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select boost" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="1">None (1x)</SelectItem>
                                                        <SelectItem value="1.5">1.5x Boost</SelectItem>
                                                        <SelectItem value="2">2x (Double)</SelectItem>
                                                        <SelectItem value="3">3x (Triple)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription className="text-xs">If it gives extra items/currency.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="timeSavedPerDay"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Time Saved (Minutes/Day)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                                                </FormControl>
                                                <FormDescription className="text-xs">e.g. Teleport, Auto-Hatch, Speed</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg">
                                ANALYZE VALUE
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <div className="animate-in slide-in-from-top-4 duration-500 fade-in">
                    <Card className={`bg-slate-950 text-white border-slate-800 relative overflow-hidden ${result.status === 'must-buy' ? 'border-emerald-500/50' : result.status === 'bad-deal' ? 'border-red-500/50' : ''}`}>
                        <div className={`absolute inset-0 bg-gradient-to-r ${result.status === 'must-buy' ? 'from-emerald-900/20' : result.status === 'bad-deal' ? 'from-red-900/20' : 'from-orange-900/20'} to-transparent animate-pulse`}></div>
                        <CardHeader className="relative pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Value Verdict</CardTitle>
                        </CardHeader>
                        <CardContent className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-slate-400 text-xs uppercase tracking-wider">Rating</h4>
                                <div className="flex items-baseline gap-2">
                                    <p className={`text-4xl font-black tracking-tight ${result.status === 'must-buy' ? 'text-emerald-400' : result.status === 'bad-deal' ? 'text-red-400' : 'text-orange-400'}`}>
                                        {result.status === 'must-buy' ? 'MUST BUY' : result.status === 'good-deal' ? 'GOOD DEAL' : result.status === 'fair' ? 'FAIR' : 'BAD DEAL'}
                                    </p>
                                </div>
                                <p className="text-sm text-slate-300 font-medium mt-1">
                                    {result.interpretation}
                                </p>

                                <div className="mt-6 space-y-2">
                                    {result.recommendations.map((rec, i) => (
                                        <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                                            {result.status === 'must-buy' ? <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" /> : <MinusCircle className="w-3 h-3 text-slate-500 mt-0.5 shrink-0" />}
                                            <span>{rec}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3 flex flex-col justify-center">
                                <div className="p-3 bg-white/5 rounded border border-white/10 flex justify-between items-center">
                                    <div>
                                        <div className="text-xs text-slate-400">Time Saved (Month)</div>
                                        <div className="font-bold text-white">{result.timeSavedTotal}</div>
                                    </div>
                                    <Clock className="w-5 h-5 text-blue-400" />
                                </div>
                                <div className="p-3 bg-white/5 rounded border border-white/10 flex justify-between items-center">
                                    <div>
                                        <div className="text-xs text-slate-400">Extra Earnings (Daily)</div>
                                        <div className="font-bold text-white">+{result.dailyVirtualEarnings}</div>
                                    </div>
                                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div className="p-3 bg-white/5 rounded border border-white/10 flex justify-between items-center">
                                    <div>
                                        <div className="text-xs text-slate-400">Break Even Point</div>
                                        <div className="font-bold text-white">{result.breakEvenHours}</div>
                                    </div>
                                    <Activity className="w-5 h-5 text-orange-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Calculator className="h-5 w-5 text-orange-600" />
                            Cost of Use
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-muted-foreground">
                        <p>We calculate value based on <strong>utility per hour</strong>.</p>
                        <p>A 500 Robux gamepass used for 100 hours costs <strong>5 Robux/hour</strong>. This is an excellent ratio.</p>
                        <p>A 2,000 Robux pass used for 10 hours costs <strong>200 Robux/hour</strong>. That is very expensive entertainment.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Coins className="h-5 w-5 text-orange-600" />
                            Multiplier Logic
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-muted-foreground">
                        <p><strong>Compound Grinding:</strong> A 2x pass makes 1 hour of grinding equal to 2 hours of results.</p>
                        <p>If you grind 1 hour daily, a 2x Pass saves you <strong>30 hours</strong> of real life in a single month.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
