
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Waves } from 'lucide-react';

const formSchema = z.object({
  diameter: z.number().positive(),
  velocity: z.number().positive(),
  pressureDrop: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PipeFlowCalculator() {
  const [result, setResult] = useState<{ flowRate: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      diameter: undefined,
      velocity: undefined,
      pressureDrop: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { diameter, velocity } = values;
    
    const area = Math.PI * Math.pow(diameter / 2, 2);
    const flowRate = area * velocity;
    
    setResult({ flowRate });
  };

  return (
    <div className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>Simple Flow Rate</CardTitle>
                <CardDescription>This calculator finds the flow rate (Q) based on pipe area and fluid velocity (Q = A * v).</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="diameter" render={({ field }) => (
                            <FormItem><FormLabel>Pipe Inner Diameter</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="velocity" render={({ field }) => (
                            <FormItem><FormLabel>Fluid Velocity</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                    <Button type="submit">Calculate Flow Rate</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
      
      {result && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Waves className="h-8 w-8 text-primary" /><CardTitle>Flow Rate Result</CardTitle></div></CardHeader>
          <CardContent>
            <p className="text-xl">The flow rate is <strong>{result.flowRate.toFixed(4)}</strong>.</p>
            <CardDescription className='mt-4'>Units must be consistent. If diameter is in meters and velocity is in m/s, the flow rate will be in cubic meters per second.</CardDescription>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
            <CardTitle>Darcy-Weisbach & Pressure Drop</CardTitle>
        </CardHeader>
        <CardContent>
            <p className='text-muted-foreground'>Calculating pressure drop is more complex, involving the Darcy-Weisbach equation, friction factor (from a Moody chart or Colebrook equation), and Reynolds number. This is beyond the scope of a simple calculator and requires iterative solutions or lookup tables.</p>
        </CardContent>
      </Card>

    </div>
  );
}
