
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Battery } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const schemaByCurrent = z.object({
  capacity: z.number().positive(),
  currentDraw: z.number().positive(),
});

const schemaByPower = z.object({
  capacity: z.number().positive(),
  voltage: z.number().positive(),
  powerDraw: z.number().positive(),
});

type FormValuesCurrent = z.infer<typeof schemaByCurrent>;
type FormValuesPower = z.infer<typeof schemaByPower>;

export default function BatteryLifeEstimator() {
  const [result, setResult] = useState<string | null>(null);

  const formCurrent = useForm<FormValuesCurrent>({
    resolver: zodResolver(schemaByCurrent),
    defaultValues: { capacity: undefined, currentDraw: undefined },
  });

  const formPower = useForm<FormValuesPower>({
    resolver: zodResolver(schemaByPower),
    defaultValues: { capacity: undefined, voltage: undefined, powerDraw: undefined },
  });

  const onCurrentSubmit = (values: FormValuesCurrent) => {
    const life = values.capacity / values.currentDraw;
    setResult(formatDuration(life));
  };

  const onPowerSubmit = (values: FormValuesPower) => {
    const life = (values.capacity * values.voltage) / values.powerDraw;
    setResult(formatDuration(life));
  };
  
  const formatDuration = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h} hours and ${m} minutes`;
  }

  return (
    <div className="space-y-8">
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current">From Current Draw</TabsTrigger>
          <TabsTrigger value="power">From Power Draw</TabsTrigger>
        </TabsList>
        <TabsContent value="current">
            <Card>
                <CardHeader>
                    <CardTitle>Calculate from Current Draw</CardTitle>
                    <CardDescription>Use this if you know the average current your device consumes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...formCurrent}>
                        <form onSubmit={formCurrent.handleSubmit(onCurrentSubmit)} className="space-y-6">
                            <FormField control={formCurrent.control} name="capacity" render={({ field }) => (
                                <FormItem><FormLabel>Battery Capacity (mAh)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={formCurrent.control} name="currentDraw" render={({ field }) => (
                                <FormItem><FormLabel>Device Current Draw (mA)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <Button type="submit">Calculate</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="power">
             <Card>
                <CardHeader>
                    <CardTitle>Calculate from Power Draw</CardTitle>
                    <CardDescription>Use this if you know the total power your device consumes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...formPower}>
                        <form onSubmit={formPower.handleSubmit(onPowerSubmit)} className="space-y-6">
                            <FormField control={formPower.control} name="capacity" render={({ field }) => (
                                <FormItem><FormLabel>Battery Capacity (mAh)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={formPower.control} name="voltage" render={({ field }) => (
                                <FormItem><FormLabel>Battery Voltage (V)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={formPower.control} name="powerDraw" render={({ field }) => (
                                <FormItem><FormLabel>Device Power Draw (mW)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <Button type="submit">Calculate</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
      
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Battery className="h-8 w-8 text-primary" /><CardTitle>Estimated Battery Life</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result}</p>
                <CardDescription className='mt-4 text-center'>This is an ideal estimate. Real-world performance may be lower due to temperature, battery age, and varying load.</CardDescription>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Battery Capacity (mAh)</h4>
                    <p>Milliampere-hours. A measure of the total charge a battery can store. This is usually printed on the battery itself.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Device Current Draw (mA)</h4>
                    <p>The average current your device consumes in milliamps. This can often be found on the device's datasheet or measured with a multimeter.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Battery Voltage (V)</h4>
                    <p>The nominal voltage of the battery (e.g., 3.7V for a LiPo, 1.5V for an AA battery).</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Device Power Draw (mW)</h4>
                    <p>The average power your device consumes in milliwatts. This is sometimes listed instead of current draw. Power (mW) = Voltage (V) * Current (mA).</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>The calculator uses two common methods to estimate battery life:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li><strong>From Current Draw:</strong> This is the simplest method. It divides the total capacity of the battery (in milliamp-hours) by the average current the device draws (in milliamps) to get the life in hours.</li>
                    <li><strong>From Power Draw:</strong> This method first calculates the total energy stored in the battery (in milliwatt-hours) by multiplying capacity (mAh) by voltage (V). Then, it divides this energy by the device's power consumption (in milliwatts) to find the life in hours.</li>
                </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
