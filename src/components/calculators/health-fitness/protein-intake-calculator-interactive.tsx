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
import { Utensils, Target, Activity, Dumbbell, Sofa, Flame } from 'lucide-react';

const goals = {
    sedentary: { min: 0.8, max: 1.2, label: 'Sedentary / Maintenance', icon: Sofa, description: 'Basic health maintenance for non-active individuals.' },
    muscle: { min: 1.6, max: 2.2, label: 'Muscle Building / Strength', icon: Dumbbell, description: 'Maximize muscle protein synthesis and hypertrophy.' },
    endurance: { min: 1.2, max: 1.6, label: 'Endurance Athlete', icon: Activity, description: 'Support recovery from aerobic training.' },
    fatLoss: { min: 1.8, max: 2.7, label: 'Fat Loss (in a deficit)', icon: Flame, description: 'Preserve lean mass during caloric restriction.' },
};

const formSchema = z.object({
    weight: z.number().positive({ message: "Weight must be positive" }),
    unit: z.enum(['kg', 'lbs']),
    goal: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ProteinIntakeCalculatorInteractive() {
    const [result, setResult] = useState<{ min: number; max: number; goal: string } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            weight: 70,
            unit: 'kg',
            goal: 'muscle',
        },
    });

    const onSubmit = (values: FormValues) => {
        let weightInKg = values.weight;
        if (values.unit === 'lbs') {
            weightInKg *= 0.453592;
        }

        const goalData = goals[values.goal as keyof typeof goals];

        setResult({
            min: weightInKg * goalData.min,
            max: weightInKg * goalData.max,
            goal: values.goal
        });
    };

    const unit = form.watch('unit');
    const selectedGoal = form.watch('goal');
    const goalInfo = goals[selectedGoal as keyof typeof goals];

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Calculate Your Protein Needs
                    </CardTitle>
                    <CardDescription>
                        Determine your optimal daily protein intake range based on science-backed guidelines.
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

                                <FormField control={form.control} name="goal" render={({ field }) => (
                                    <FormItem className="h-full flex flex-col">
                                        <FormLabel>Primary Goal</FormLabel>
                                        <div className="grid grid-cols-1 gap-2 mt-2">
                                            {Object.entries(goals).map(([key, value]) => {
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
                                    <strong>Selected Goal:</strong> {goalInfo.label}
                                </p>
                                <p className="mt-1">
                                    {goalInfo.description} Multiplier: {goalInfo.min}-{goalInfo.max} g/kg.
                                </p>
                            </div>

                            <Button type="submit" className="w-full" size="lg">Calculate Range</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <Card className="border-primary/50 overflow-hidden text-center bg-gradient-to-b from-primary/5 to-transparent">
                    <CardHeader>
                        <div className='flex justify-center mb-4'>
                            <div className="p-4 bg-primary rounded-full shadow-lg">
                                <Utensils className="h-8 w-8 text-primary-foreground" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl">Recommended Daily Protein Intake</CardTitle>
                        <CardDescription>For a {form.getValues().weight} {form.getValues().unit} individual aiming for {goals[result.goal as keyof typeof goals].label}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-8">
                        <div className="flex justify-center items-baseline gap-2 mb-2">
                            <span className="text-5xl font-extrabold text-primary">{result.min.toFixed(0)}</span>
                            <span className="text-2xl text-muted-foreground font-medium">to</span>
                            <span className="text-5xl font-extrabold text-primary">{result.max.toFixed(0)}</span>
                            <span className="text-xl font-bold text-muted-foreground ml-1">grams / day</span>
                        </div>

                        <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
                            Spread this amount across 3-5 meals (approx. <strong>{(result.min / 4).toFixed(0)}-{(result.max / 4).toFixed(0)}g per meal</strong>) to maximize absorption and muscle protein synthesis.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
