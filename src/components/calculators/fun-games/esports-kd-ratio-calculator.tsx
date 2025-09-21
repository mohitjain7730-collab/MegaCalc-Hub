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
import { Crosshair } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const kdSchema = z.object({
  kills: z.number().int().nonnegative(),
  deaths: z.number().int().min(1, "Deaths must be at least 1 to calculate K/D"),
});

const targetSchema = z.object({
  currentKills: z.number().int().nonnegative(),
  currentDeaths: z.number().int().nonnegative(),
  targetKD: z.number().positive("Target K/D must be positive"),
});

type FormValuesKD = z.infer<typeof kdSchema>;
type FormValuesTarget = z.infer<typeof targetSchema>;

export default function EsportsKdRatioCalculator() {
  const [kdResult, setKdResult] = useState<number | null>(null);
  const [targetResult, setTargetResult] = useState<number | null>(null);

  const formKD = useForm<FormValuesKD>({
    resolver: zodResolver(kdSchema),
    defaultValues: { kills: undefined, deaths: undefined },
  });

  const formTarget = useForm<FormValuesTarget>({
    resolver: zodResolver(targetSchema),
    defaultValues: { currentKills: undefined, currentDeaths: undefined, targetKD: undefined },
  });

  const onKDSubmit = (values: FormValuesKD) => {
    setKdResult(values.kills / values.deaths);
  };
  
  const onTargetSubmit = (values: FormValuesTarget) => {
    const neededKills = (values.targetKD * values.currentDeaths) - values.currentKills;
    setTargetResult(Math.max(0, neededKills));
  };

  return (
    <div className="space-y-8">
      <Tabs defaultValue="kd-ratio" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="kd-ratio">Calculate K/D Ratio</TabsTrigger>
          <TabsTrigger value="target-kd">Kills to Target K/D</TabsTrigger>
        </TabsList>
        <TabsContent value="kd-ratio">
            <Card>
                <CardHeader>
                    <CardTitle>Calculate K/D Ratio</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...formKD}>
                        <form onSubmit={formKD.handleSubmit(onKDSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={formKD.control} name="kills" render={({ field }) => (
                                    <FormItem><FormLabel>Total Kills</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={formKD.control} name="deaths" render={({ field }) => (
                                    <FormItem><FormLabel>Total Deaths</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                            <Button type="submit">Calculate K/D</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="target-kd">
             <Card>
                <CardHeader>
                    <CardTitle>Calculate Kills Needed for Target K/D</CardTitle>
                    <CardDescription>How many kills do you need in a row (0 deaths) to reach your goal?</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...formTarget}>
                        <form onSubmit={formTarget.handleSubmit(onTargetSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={formTarget.control} name="currentKills" render={({ field }) => (
                                    <FormItem><FormLabel>Current Kills</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={formTarget.control} name="currentDeaths" render={({ field }) => (
                                    <FormItem><FormLabel>Current Deaths</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                            <FormField control={formTarget.control} name="targetKD" render={({ field }) => (
                                <FormItem><FormLabel>Target K/D Ratio</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <Button type="submit">Calculate</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
      
      {kdResult !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Crosshair className="h-8 w-8 text-primary" /><CardTitle>Your K/D Ratio</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{kdResult.toFixed(2)}</p>
            </CardContent>
        </Card>
      )}
       {targetResult !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Crosshair className="h-8 w-8 text-primary" /><CardTitle>Kills to Target</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{Math.ceil(targetResult)}</p>
                <CardDescription className='mt-4 text-center'>You need to get {Math.ceil(targetResult)} more kills without dying to reach a {formTarget.getValues('targetKD')} K/D ratio.</CardDescription>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
