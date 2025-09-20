'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/componentsui/card';
import { Calculator } from 'lucide-react';

const formSchema = z.object({
  shape: z.enum(['rectangle', 'circle', 'i-beam']),
  base: z.number().positive().optional(),
  height: z.number().positive().optional(),
  radius: z.number().positive().optional(),
  webHeight: z.number().positive().optional(),
  webThickness: z.number().positive().optional(),
  flangeWidth: z.number().positive().optional(),
  flangeThickness: z.number().positive().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function MomentOfInertiaCalculator() {
  const [result, setResult] = useState<{ Ix: number, Iy: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shape: 'rectangle',
    },
  });

  const onSubmit = (values: FormValues) => {
    const { shape, base, height, radius, webHeight, webThickness, flangeWidth, flangeThickness } = values;

    let Ix, Iy;

    switch (shape) {
      case 'rectangle':
        if (!base || !height) return;
        Ix = (base * Math.pow(height, 3)) / 12;
        Iy = (height * Math.pow(base, 3)) / 12;
        break;
      case 'circle':
        if (!radius) return;
        Ix = Iy = (Math.PI * Math.pow(radius, 4)) / 4;
        break;
      case 'i-beam':
        if (!webHeight || !webThickness || !flangeWidth || !flangeThickness) return;
        const flangeInertiaX = (flangeWidth * Math.pow(flangeThickness, 3)) / 12;
        const flangeArea = flangeWidth * flangeThickness;
        const flangeDist = (webHeight / 2) + (flangeThickness / 2);
        const webInertiaX = (webThickness * Math.pow(webHeight, 3)) / 12;
        Ix = webInertiaX + 2 * (flangeInertiaX + flangeArea * Math.pow(flangeDist, 2));

        const flangeInertiaY = (flangeThickness * Math.pow(flangeWidth, 3)) / 12;
        const webInertiaY = (webHeight * Math.pow(webThickness, 3)) / 12;
        Iy = webInertiaY + 2 * flangeInertiaY;
        break;
    }
    
    setResult({ Ix, Iy });
  };
  
  const shape = form.watch('shape');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="shape" render={({ field }) => (
              <FormItem><FormLabel>Shape</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>
                  <SelectItem value="rectangle">Rectangle</SelectItem>
                  <SelectItem value="circle">Circle</SelectItem>
                  <SelectItem value="i-beam">I-Beam</SelectItem>
              </SelectContent></Select></FormItem>
          )} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shape === 'rectangle' && <>
                <FormField control={form.control} name="base" render={({ field }) => (<FormItem><FormLabel>Base (b)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="height" render={({ field }) => (<FormItem><FormLabel>Height (h)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
            </>}
            {shape === 'circle' && <>
                <FormField control={form.control} name="radius" render={({ field }) => (<FormItem><FormLabel>Radius (r)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
            </>}
            {shape === 'i-beam' && <>
                <FormField control={form.control} name="flangeWidth" render={({ field }) => (<FormItem><FormLabel>Flange Width (bf)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="flangeThickness" render={({ field }) => (<FormItem><FormLabel>Flange Thickness (tf)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="webHeight" render={({ field }) => (<FormItem><FormLabel>Web Height (d)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="webThickness" render={({ field }) => (<FormItem><FormLabel>Web Thickness (tw)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
            </>}
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Calculator className="h-8 w-8 text-primary" /><CardTitle>Moment of Inertia</CardTitle></div></CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-lg space-y-2">
                <li><strong>About X-axis (Ix):</strong> {result.Ix.toFixed(4)}</li>
                <li><strong>About Y-axis (Iy):</strong> {result.Iy.toFixed(4)}</li>
            </ul>
            <CardDescription className='mt-4'>Result units are length to the fourth power (e.g., in⁴ or m⁴).</CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
