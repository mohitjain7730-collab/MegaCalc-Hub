'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
    petName: z.string().min(1, "Enter pet name"),
    baseValue: z.number().min(0).default(1000000000), // 1B
    targetType: z.enum(['golden', 'rainbow', 'dark_matter']),
    isShiny: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    targetValue: string;
    multiplierApplied: string;
    description: string;
    shinyBonus: string;
};

// Value Scaling Logic (Approximations based on Trading Economy)
// Golden = ~3x Normal
// Rainbow = ~13x Normal
// Dark Matter = ~40-50x Normal (Because of time gate)
const SCALING = {
    'golden': { val: 3, label: '3x (Golden)' },
    'rainbow': { val: 13, label: '13x (Rainbow)' },
    'dark_matter': { val: 45, label: '45x (Dark Matter)' },
};

function formatNumber(num: number): string {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + " T (Trillion)";
    if (num >= 1e9) return (num / 1e9).toFixed(2) + " B (Billion)";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + " M (Million)";
    return num.toLocaleString();
}

const calculateGoldenVal = (values: FormValues): ResultPayload => {
    const scale = SCALING[values.targetType as keyof typeof SCALING];
    let multiplier = scale.val;

    let shinyText = "No";
    if (values.isShiny) {
        multiplier *= 2.5; // Shiny versions are often 2-3x more valuable than non-shiny equivalents
        shinyText = "Yes (2.5x Bonus)";
    }

    const calculatedVal = values.baseValue * multiplier;

    return {
        targetValue: formatNumber(calculatedVal),
        multiplierApplied: multiplier + "x Total Multiplier",
        description: `Upgrading your Normal ${values.petName} to ${values.targetType.replace('_', ' ').toUpperCase()} increases its value significantly.`,
        shinyBonus: shinyText,
    };
};

export default function RobloxPetSimulatorXGoldenPetValueInteractive() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            petName: 'Dragon',
            baseValue: 1000000000,
            targetType: 'golden',
            isShiny: false,
        },
    });

    const onSubmit = (values: FormValues) => {
        setResult(calculateGoldenVal(values));
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Conversion Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="petName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Pet Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Dog" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="baseValue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Normal Value (Gems)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="targetType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Target Upgrade</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="golden">Golden (3x Stat)</SelectItem>
                                                    <SelectItem value="rainbow">Rainbow (13x Stat)</SelectItem>
                                                    <SelectItem value="dark_matter">Dark Matter (45x Stat)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="isShiny"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-lg bg-muted/50 mt-8">
                                            <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>Is Shiny?</FormLabel>
                                                <FormMessage />
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-700 font-bold text-white">
                                CALCULATE UPGRADE VALUE
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result ? (
                <div className="animate-in slide-in-from-top-4 duration-500 fade-in">
                    <Card className="bg-slate-950 text-white border-slate-800 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-900/40 to-orange-600/10 animate-pulse"></div>
                        <CardHeader className="relative pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Upgrade Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-slate-400 text-xs uppercase tracking-wider">New Estimated Value</h4>
                                    <p className="text-3xl font-black text-white">{result.targetValue}</p>
                                    <p className="text-sm text-yellow-500 mt-1">{result.multiplierApplied}</p>
                                </div>
                            </div>

                            <div className="space-y-4 flex flex-col justify-center">
                                <div className="p-4 border border-white/10 bg-white/5 rounded-xl text-center">
                                    <h4 className="flex justify-center items-center gap-2 font-bold mb-1 text-white">
                                        <Sparkles className="h-4 w-4 text-purple-400" /> Shiny Bonus
                                    </h4>
                                    <p className="text-xl font-bold text-slate-200">{result.shinyBonus}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="flex items-center justify-center p-8 text-muted-foreground bg-muted/10 border-2 border-dashed rounded-xl">
                    <div className="text-center space-y-4 max-w-sm">
                        <Zap className="w-16 h-16 mx-auto opacity-20" />
                        <h3 className="text-lg font-semibold">Value Converter</h3>
                        <p>See how much value converting to Dark Matter adds.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
