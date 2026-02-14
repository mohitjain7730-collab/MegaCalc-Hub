"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Utensils, Target, Flame, Dumbbell, Activity, Bike } from 'lucide-react';

const activityLevels = {
    low: { min: 2, max: 3, label: 'Low Intensity / Sedentary', icon: Utensils, description: 'Walking, yoga, or <30 min light activity.' },
    moderate: { min: 3, max: 5, label: 'Moderate Activity (~1 hr/day)', icon: Dumbbell, description: 'General gym training, jogging, recreational sports.' },
    high: { min: 5, max: 7, label: 'High Activity (1-2 hr/day)', icon: Activity, description: 'CrossFit, extensive running, team sports.' },
    veryHigh: { min: 7, max: 10, label: 'Very High Activity (2-4+ hr/day)', icon: Bike, description: 'Endurance events, two-a-days, intense competition.' },
};

const formSchema = z.object({
    weight: z.number().positive({ message: "Weight must be positive" }),
    unit: z.enum(['kg', 'lbs']),
    activityLevel: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CarbohydrateIntakeCalculatorInteractive() {
    const [result, setResult] = useState<{ min: number; max: number; level: string } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            weight: 70,
            unit: 'kg',
            activityLevel: 'moderate',
        },
    });

    const onSubmit = (values: FormValues) => {
        let weightInKg = values.weight;
        if (values.unit === 'lbs') {
            weightInKg *= 0.453592;
        }

        const levelData = activityLevels[values.activityLevel as keyof typeof activityLevels];

        setResult({
            min: weightInKg * levelData.min,
            max: weightInKg * levelData.max,
            level: values.activityLevel
        });
    };

    const selectedLevel = form.watch('activityLevel');
    const levelInfo = activityLevels[selectedLevel as keyof typeof activityLevels];

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Calculate Your Carbohydrate Needs
                    </CardTitle>
                    <CardDescription>
                        Determine your optimal daily carb intake based on activity volume to fuel performance.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <FormField control={form.control} name="weight" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Body Weight</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="unit" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Unit</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                                                    <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )} />
                                </div>

                                <FormField control={form.control} name="activityLevel" render={({ field }) => (
                                    <FormItem className="h-full flex flex-col">
                                        <FormLabel>Daily Activity Level</FormLabel>
                                        <div className="grid grid-cols-1 gap-2 mt-2">
                                            {Object.entries(activityLevels).map(([key, value]) => {
                                                const Icon = value.icon;
                                                return (
                                                    <div
                                                        key={key}
                                                        onClick={() => field.onChange(key)}
                                                        className={`cursor-pointer border rounded-lg p-3 flex items-center gap-3 transition-all ${field.value === key ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted/50'}`}
                                                    >
                                                        <div className={`p-2 rounded-full ${field.value === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                                            <Icon className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-sm">{value.label}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </FormItem>
                                )} />
                            </div>

                            <div className="p-4 bg-muted/30 rounded-lg border text-sm text-muted-foreground">
                                <p>
                                    <strong>Selected Level:</strong> {levelInfo.label}
                                </p>
                                <p className="mt-1">
                                    {levelInfo.description} Multiplier: {levelInfo.min}-{levelInfo.max} g/kg.
                                </p>
                            </div>

                            <Button type="submit" className="w-full" size="lg">Calculate Range</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <Card className="border-primary/50 overflow-hidden text-center bg-gradient-to-b from-orange-50/50 to-transparent dark:from-orange-950/20">
                    <CardHeader>
                        <div className='flex justify-center mb-4'>
                            <div className="p-4 bg-orange-500 rounded-full shadow-lg">
                                <Flame className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl">Recommended Daily Carb Intake</CardTitle>
                        <CardDescription>For a {form.getValues().weight} {form.getValues().unit} individual performing {activityLevels[result.level as keyof typeof activityLevels].label.toLowerCase()}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-8">
                        <div className="flex justify-center items-baseline gap-2 mb-2">
                            <span className="text-5xl font-extrabold text-orange-600 dark:text-orange-400">{result.min.toFixed(0)}</span>
                            <span className="text-2xl text-muted-foreground font-medium">to</span>
                            <span className="text-5xl font-extrabold text-orange-600 dark:text-orange-400">{result.max.toFixed(0)}</span>
                            <span className="text-xl font-bold text-muted-foreground ml-1">grams / day</span>
                        </div>

                        <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
                            Equating to approximately <strong>{(result.min * 4).toFixed(0)}-{(result.max * 4).toFixed(0)} Calories</strong> from carbohydrates per day.
                        </p>
                        <div className="mt-6 flex justify-center gap-4 text-sm">
                            <div className="px-4 py-2 bg-background border rounded-lg shadow-sm">
                                <span className="block font-bold text-foreground">Pre-Workout</span>
                                30-60g carbs
                            </div>
                            <div className="px-4 py-2 bg-background border rounded-lg shadow-sm">
                                <span className="block font-bold text-foreground">Post-Workout</span>
                                1.0-1.2g/kg
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
