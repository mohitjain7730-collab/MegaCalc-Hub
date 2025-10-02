
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
import { Ruler, ArrowUp } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  sex: z.enum(['male', 'female']),
  height: z.number().positive(),
  waist: z.number().positive(),
  neck: z.number().positive(),
  hip: z.number().positive().optional(),
  unit: z.enum(['cm', 'in']),
}).refine(data => data.sex === 'female' ? data.hip !== undefined && data.hip > 0 : true, {
    message: "Hip measurement is required for females.",
    path: ["hip"],
});

type FormValues = z.infer<typeof formSchema>;

const getBfpCategory = (bfp: number, sex: 'male' | 'female') => {
  const categories = sex === 'female' ? 
    { essential: 10, athletes: 14, fitness: 21, average: 25, obese: 32 } :
    { essential: 2, athletes: 6, fitness: 14, average: 18, obese: 25 };

  if (bfp < categories.essential) return { name: 'Below Essential Fat', color: 'bg-red-500' };
  if (bfp < categories.athletes) return { name: 'Essential Fat', color: 'bg-yellow-400' };
  if (bfp < categories.fitness) return { name: 'Athletes', color: 'bg-green-500' };
  if (bfp < categories.average) return { name: 'Fitness', color: 'bg-green-500' };
  if (bfp < categories.obese) return { name: 'Average', color: 'bg-yellow-400' };
  return { name: 'Obese', color: 'bg-red-500' };
};

export default function BodyFatPercentageCalculator() {
  const [result, setResult] = useState<{ bfp: number; category: { name: string; color: string } } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sex: 'male',
      unit: 'cm',
      height: undefined,
      waist: undefined,
      neck: undefined,
      hip: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { sex, height, waist, neck, hip, unit } = values;

    let bfp;
    if (unit === 'cm') {
        if (sex === 'male') {
          bfp = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
        } else {
          bfp = 495 / (1.29579 - 0.35004 * Math.log10(waist + (hip || 0) - neck) + 0.22100 * Math.log10(height)) - 450;
        }
    } else { // inches
        if (sex === 'male') {
          bfp = 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;
        } else {
          bfp = 163.205 * Math.log10(waist + (hip || 0) - neck) - 97.684 * Math.log10(height) - 78.387;
        }
    }


    setResult({ bfp, category: getBfpCategory(bfp, sex) });
  };
  
  const sex = form.watch('sex');
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
                <FormItem><FormLabel>Units</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="cm">cm</SelectItem><SelectItem value="in">inches</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="height" render={({ field }) => (<FormItem><FormLabel>Height ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="waist" render={({ field }) => (<FormItem><FormLabel>Waist ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="neck" render={({ field }) => (<FormItem><FormLabel>Neck ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            {sex === 'female' && <FormField control={form.control} name="hip" render={({ field }) => (<FormItem><FormLabel>Hip ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />}
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Ruler className="h-8 w-8 text-primary" /><CardTitle>Estimated Body Fat</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.bfp.toFixed(1)}%</p>
                    <p className={`text-2xl font-semibold`}>{result.category.name}</p>
                </div>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator uses the U.S. Navy method, which relies on body measurements to estimate body fat percentage. It's a convenient alternative to more complex methods like skinfold calipers or hydrostatic weighing. Different formulas are used for males and females to account for differences in body composition.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
