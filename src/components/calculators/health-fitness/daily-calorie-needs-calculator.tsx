
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


const formSchema = z.object({
  age: z.number().positive().int(),
  gender: z.enum(['male', 'female']),
  weight: z.number().positive(),
  height: z.number().positive(),
  unit: z.enum(['metric', 'imperial']),
  activityLevel: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

const activityLevels = [
    { name: 'Sedentary', description: 'Little or no exercise', multiplier: 1.2 },
    { name: 'Lightly Active', description: 'Light exercise (1-3 days/week)', multiplier: 1.375 },
    { name: 'Moderately Active', description: 'Moderate exercise (3-5 days/week)', multiplier: 1.55 },
    { name: 'Very Active', description: 'Hard exercise (6-7 days/week)', multiplier: 1.725 },
    { name: 'Extra Active', description: 'Very hard exercise & physical job', multiplier: 1.9 },
];

export default function DailyCalorieNeedsCalculator() {
  const [result, setResult] = useState<{tdee: number, bmr: number} | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'metric',
      age: undefined,
      gender: 'male',
      weight: undefined,
      height: undefined,
      activityLevel: '1.375',
    },
  });

  const onSubmit = (values: FormValues) => {
    const { age, gender, unit } = values;
    let { weight, height } = values;

    if (unit === 'imperial') {
      weight *= 0.453592; // lbs to kg
      height *= 2.54;     // inches to cm
    }

    let bmr;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    const tdee = bmr * parseFloat(values.activityLevel);

    setResult({tdee, bmr});
  };
  
  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem><FormLabel>Units</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="metric">Metric (kg, cm)</SelectItem><SelectItem value="imperial">Imperial (lbs, in)</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="gender" render={({ field }) => (
                <FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="age" render={({ field }) => (
                <FormItem><FormLabel>Age (years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="weight" render={({ field }) => (
                <FormItem><FormLabel>Weight ({unit === 'metric' ? 'kg' : 'lbs'})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="height" render={({ field }) => (
                <FormItem><FormLabel>Height ({unit === 'metric' ? 'cm' : 'in'})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="activityLevel" render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                        {activityLevels.map(level => (
                            <SelectItem key={level.name} value={String(level.multiplier)}>{level.name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate TDEE</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Flame className="h-8 w-8 text-primary" /><CardTitle>Your TDEE Result</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.tdee.toFixed(0)}</p>
                    <CardDescription>Estimated calories/day to maintain your current weight.</CardDescription>
                </div>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator uses the Mifflin-St Jeor equation to estimate your Basal Metabolic Rate (BMR), which is the calories your body burns at rest. It then multiplies your BMR by an activity multiplier to estimate your Total Daily Energy Expenditure (TDEE).</p>
                <p className="font-mono p-2 bg-muted rounded-md text-sm">TDEE = BMR × Activity Multiplier</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
