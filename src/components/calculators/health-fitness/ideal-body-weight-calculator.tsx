
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
import { Target } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  sex: z.enum(['male', 'female']),
  heightFeet: z.number().int().positive().optional(),
  heightInches: z.number().int().nonnegative().optional(),
  heightCm: z.number().positive().optional(),
  unit: z.enum(['imperial', 'metric']),
}).refine(data => data.unit === 'metric' ? data.heightCm !== undefined : (data.heightFeet !== undefined && data.heightInches !== undefined), {
    message: "Height is required.",
    path: ["heightCm"],
});

type FormValues = z.infer<typeof formSchema>;

export default function IdealBodyWeightCalculator() {
  const [result, setResult] = useState<{ ibw: number; range: { min: number, max: number } } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sex: 'male',
      unit: 'imperial',
    },
  });

  const onSubmit = (values: FormValues) => {
    let heightInInches;
    if (values.unit === 'imperial') {
      heightInInches = (values.heightFeet || 0) * 12 + (values.heightInches || 0);
    } else {
      heightInInches = (values.heightCm || 0) / 2.54;
    }

    if (heightInInches <= 60) {
        form.setError("heightFeet", {message: "Height must be over 5 feet."});
        return;
    }

    const inchesOver5Feet = heightInInches - 60;
    let ibwKg;
    if (values.sex === 'male') {
      ibwKg = 48 + 2.7 * inchesOver5Feet;
    } else {
      ibwKg = 45.5 + 2.2 * inchesOver5Feet;
    }

    setResult({
        ibw: ibwKg,
        range: { min: ibwKg * 0.9, max: ibwKg * 1.1 }
    });
  };
  
  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="sex" render={({ field }) => (
                <FormItem><FormLabel>Sex</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem><FormLabel>Units</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="imperial">Feet/Inches</SelectItem><SelectItem value="metric">Centimeters</SelectItem></SelectContent></Select></FormItem>
            )} />
            {unit === 'imperial' ? (
                <>
                <FormField control={form.control} name="heightFeet" render={({ field }) => (<FormItem><FormLabel>Height (ft)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="heightInches" render={({ field }) => (<FormItem><FormLabel>Height (in)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                </>
            ) : (
                <FormField control={form.control} name="heightCm" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Height (cm)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            )}
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Target className="h-8 w-8 text-primary" /><CardTitle>Ideal Body Weight (Hamwi Formula)</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.ibw.toFixed(1)} kg</p>
                    <p className="text-muted-foreground">({(result.ibw * 2.20462).toFixed(1)} lbs)</p>
                    <CardDescription>A healthy range is typically considered to be between {result.range.min.toFixed(1)} kg and {result.range.max.toFixed(1)} kg.</CardDescription>
                </div>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator uses the G.J. Hamwi formula, a quick and easy method to estimate a person's ideal body weight. It provides a single-point estimate, and a healthy range is typically considered to be ±10% of this value. Note that this formula does not account for factors like frame size, muscle mass, or age.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

    