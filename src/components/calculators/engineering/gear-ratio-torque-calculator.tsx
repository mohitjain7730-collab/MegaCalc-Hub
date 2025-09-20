'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

const formSchema = z.object({
  drivingGearTeeth: z.number().positive(),
  drivenGearTeeth: z.number().positive(),
  inputSpeed: z.number().positive(),
  inputTorque: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function GearRatioTorqueCalculator() {
  const [result, setResult] = useState<{ gearRatio: number, outputSpeed: number, outputTorque: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      drivingGearTeeth: undefined,
      drivenGearTeeth: undefined,
      inputSpeed: undefined,
      inputTorque: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { drivingGearTeeth, drivenGearTeeth, inputSpeed, inputTorque } = values;

    const gearRatio = drivenGearTeeth / drivingGearTeeth;
    const outputSpeed = inputSpeed / gearRatio;
    const outputTorque = inputTorque * gearRatio; // Assuming 100% efficiency
    
    setResult({ gearRatio, outputSpeed, outputTorque });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="drivingGearTeeth" render={({ field }) => (
                <FormItem><FormLabel>Driving Gear Teeth</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="drivenGearTeeth" render={({ field }) => (
                <FormItem><FormLabel>Driven Gear Teeth</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="inputSpeed" render={({ field }) => (
                <FormItem><FormLabel>Input Speed (RPM)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="inputTorque" render={({ field }) => (
                <FormItem><FormLabel>Input Torque</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Settings className="h-8 w-8 text-primary" /><CardTitle>Gear System Output</CardTitle></div></CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-lg space-y-2">
                <li><strong>Gear Ratio:</strong> {result.gearRatio.toFixed(2)} : 1</li>
                <li><strong>Output Speed:</strong> {result.outputSpeed.toFixed(2)} RPM</li>
                <li><strong>Output Torque:</strong> {result.outputTorque.toFixed(2)} (same unit as input)</li>
            </ul>
            <CardDescription className='mt-4'>This calculation assumes 100% efficiency. Real-world systems will have some torque loss.</CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
