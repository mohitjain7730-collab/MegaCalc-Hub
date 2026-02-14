"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart as PieChartIcon, RefreshCw, Target } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const formSchema = z.object({
    tdee: z.number().positive(),
    proteinPercent: z.number().min(0).max(100),
    carbPercent: z.number().min(0).max(100),
    fatPercent: z.number().min(0).max(100),
}).refine(data => Math.abs(data.proteinPercent + data.carbPercent + data.fatPercent - 100) < 1, {
    message: "Percentages must add up to 100%.",
    path: ["fatPercent"],
});

type FormValues = z.infer<typeof formSchema>;

interface Result {
    protein: number;
    carbs: number;
    fat: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

export default function MacroRatioCalculatorInteractive() {
    const [result, setResult] = useState<Result | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tdee: undefined,
            proteinPercent: 30,
            carbPercent: 40,
            fatPercent: 30,
        },
    });

    const onSubmit = (values: FormValues) => {
        const proteinGrams = (values.tdee * (values.proteinPercent / 100)) / 4;
        const carbGrams = (values.tdee * (values.carbPercent / 100)) / 4;
        const fatGrams = (values.tdee * (values.fatPercent / 100)) / 9;
        setResult({ protein: proteinGrams, carbs: carbGrams, fat: fatGrams });
    };

    const protein = form.watch('proteinPercent');
    const carbs = form.watch('carbPercent');
    const fat = form.watch('fatPercent');

    // Calculate total percentage for validation display
    const totalPercent = (protein || 0) + (carbs || 0) + (fat || 0);

    const chartData = result ? [
        { name: 'Protein', value: result.protein },
        { name: 'Carbs', value: result.carbs },
        { name: 'Fat', value: result.fat },
    ] : [];

    return (
        <div className="space-y-6">
            {/* Input Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Calculate Your Macro Ratios
                    </CardTitle>
                    <CardDescription>
                        Determine your optimal protein, carbohydrate, and fat breakdown based on your daily calorie needs
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="tdee"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex justify-between items-center">
                                            <FormLabel>Total Daily Calories (TDEE)</FormLabel>
                                            <Link href="/category/health-fitness/daily-calorie-needs-calculator" className="text-xs text-primary underline">
                                                (Calculate TDEE First)
                                            </Link>
                                        </div>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g. 2500"
                                                type="number"
                                                {...field}
                                                value={field.value ?? ''}
                                                onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-6 p-4 bg-muted/40 rounded-lg border">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-semibold text-sm">Macro Split</h4>
                                    <span className={`text-sm font-bold ${totalPercent === 100 ? 'text-green-600' : 'text-red-500'}`}>
                                        Total: {totalPercent}%
                                    </span>
                                </div>

                                <FormField control={form.control} name="proteinPercent" render={({ field }) => (
                                    <FormItem>
                                        <div className="flex justify-between">
                                            <FormLabel>Protein</FormLabel>
                                            <span className="text-sm font-mono text-muted-foreground">{field.value}%</span>
                                        </div>
                                        <FormControl><Slider defaultValue={[30]} min={0} max={100} step={5} onValueChange={(vals) => field.onChange(vals[0])} /></FormControl>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="carbPercent" render={({ field }) => (
                                    <FormItem>
                                        <div className="flex justify-between">
                                            <FormLabel>Carbohydrates</FormLabel>
                                            <span className="text-sm font-mono text-muted-foreground">{field.value}%</span>
                                        </div>
                                        <FormControl><Slider defaultValue={[40]} min={0} max={100} step={5} onValueChange={(vals) => field.onChange(vals[0])} /></FormControl>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="fatPercent" render={({ field }) => (
                                    <FormItem>
                                        <div className="flex justify-between">
                                            <FormLabel>Fat</FormLabel>
                                            <span className="text-sm font-mono text-muted-foreground">{field.value}%</span>
                                        </div>
                                        <FormControl><Slider defaultValue={[30]} min={0} max={100} step={5} onValueChange={(vals) => field.onChange(vals[0])} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <Button type="submit" className="w-full">Calculate Macros</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <Card className="border-primary/50 overflow-hidden">
                    <CardHeader className="bg-primary/5">
                        <div className='flex items-center gap-4'>
                            <PieChartIcon className="h-8 w-8 text-primary" />
                            <div>
                                <CardTitle>Your Daily Macronutrient Goals</CardTitle>
                                <CardDescription>Personalized breakdown based on {form.getValues().tdee} calories</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div className="space-y-6">
                                <div className="p-4 bg-background rounded-lg border shadow-sm flex justify-between items-center border-l-4 border-l-[hsl(var(--primary))]">
                                    <div>
                                        <p className="text-sm text-muted-foreground font-medium">Protein</p>
                                        <p className="text-xs text-muted-foreground">{protein}% of calories</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold">{result.protein.toFixed(0)}g</p>
                                        <p className="text-xs text-muted-foreground">{(result.protein * 4).toFixed(0)} kcal</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-background rounded-lg border shadow-sm flex justify-between items-center border-l-4 border-l-[hsl(var(--chart-2))]">
                                    <div>
                                        <p className="text-sm text-muted-foreground font-medium">Carbohydrates</p>
                                        <p className="text-xs text-muted-foreground">{carbs}% of calories</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold">{result.carbs.toFixed(0)}g</p>
                                        <p className="text-xs text-muted-foreground">{(result.carbs * 4).toFixed(0)} kcal</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-background rounded-lg border shadow-sm flex justify-between items-center border-l-4 border-l-[hsl(var(--chart-3))]">
                                    <div>
                                        <p className="text-sm text-muted-foreground font-medium">Fat</p>
                                        <p className="text-xs text-muted-foreground">{fat}% of calories</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold">{result.fat.toFixed(0)}g</p>
                                        <p className="text-xs text-muted-foreground">{(result.fat * 9).toFixed(0)} kcal</p>
                                    </div>
                                </div>
                            </div>
                            <div className="h-64 flex flex-col items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: number) => [`${value.toFixed(0)}g`, 'Amount']}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <p className="text-xs text-muted-foreground text-center mt-2">
                                    Visual breakdown of your macro distribution
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
