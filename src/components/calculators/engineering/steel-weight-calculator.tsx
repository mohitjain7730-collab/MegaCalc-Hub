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
import { Scale } from 'lucide-react';

const DENSITY_STEEL_KG_M3 = 7850;
const DENSITY_STEEL_LB_IN3 = 0.284;

const formSchema = z.object({
  shape: z.enum(['bar', 'sheet', 'pipe']),
  unit: z.enum(['metric', 'imperial']),
  length: z.number().positive().optional(),
  width: z.number().positive().optional(),
  thickness: z.number().positive().optional(),
  diameter: z.number().positive().optional(),
  outerDiameter: z.number().positive().optional(),
  wallThickness: z.number().positive().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SteelWeightCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shape: 'bar',
      unit: 'metric',
    },
  });

  const onSubmit = (values: FormValues) => {
    const { shape, unit, length, width, thickness, diameter, outerDiameter, wallThickness } = values;
    let volume = 0;

    if (shape === 'bar') {
      if (!diameter || !length) return;
      volume = Math.PI * Math.pow(diameter / 2, 2) * length;
    } else if (shape === 'sheet') {
      if (!length || !width || !thickness) return;
      volume = length * width * thickness;
    } else if (shape === 'pipe') {
      if (!outerDiameter || !wallThickness || !length) return;
      const innerDiameter = outerDiameter - 2 * wallThickness;
      const outerArea = Math.PI * Math.pow(outerDiameter / 2, 2);
      const innerArea = Math.PI * Math.pow(innerDiameter / 2, 2);
      volume = (outerArea - innerArea) * length;
    }
    
    const density = unit === 'metric' ? DENSITY_STEEL_KG_M3 : DENSITY_STEEL_LB_IN3;
    setResult(volume * density);
  };
  
  const shape = form.watch('shape');
  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="shape" render={({ field }) => (
                    <FormItem><FormLabel>Shape</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>
                        <SelectItem value="bar">Round Bar</SelectItem>
                        <SelectItem value="sheet">Sheet/Plate</SelectItem>
                        <SelectItem value="pipe">Pipe/Tube</SelectItem>
                    </SelectContent></Select></FormItem>
                )} />
                <FormField control={form.control} name="unit" render={({ field }) => (
                    <FormItem><FormLabel>Units</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>
                        <SelectItem value="metric">Metric (m, mm, kg)</SelectItem>
                        <SelectItem value="imperial">Imperial (in, lb)</SelectItem>
                    </SelectContent></Select></FormItem>
                )} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shape === 'bar' && <>
                    <FormField control={form.control} name="diameter" render={({ field }) => (<FormItem><FormLabel>Diameter</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="length" render={({ field }) => (<FormItem><FormLabel>Length</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                </>}
                {shape === 'sheet' && <>
                    <FormField control={form.control} name="length" render={({ field }) => (<FormItem><FormLabel>Length</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="width" render={({ field }) => (<FormItem><FormLabel>Width</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="thickness" render={({ field }) => (<FormItem><FormLabel>Thickness</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                </>}
                 {shape === 'pipe' && <>
                    <FormField control={form.control} name="outerDiameter" render={({ field }) => (<FormItem><FormLabel>Outer Diameter</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="wallThickness" render={({ field }) => (<FormItem><FormLabel>Wall Thickness</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="length" render={({ field }) => (<FormItem><FormLabel>Length</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                </>}
            </div>
            <CardDescription>Enter all metric dimensions in meters. Enter all imperial dimensions in inches.</CardDescription>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Scale className="h-8 w-8 text-primary" /><CardTitle>Calculated Weight</CardTitle></div></CardHeader>
          <CardContent>
            <p className="text-xl">The weight is <strong>{result.toFixed(2)} {unit === 'metric' ? 'kg' : 'lbs'}</strong>.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
