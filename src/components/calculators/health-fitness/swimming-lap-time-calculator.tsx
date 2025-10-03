
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Waves } from 'lucide-react';

const formSchema = z.object({
  totalMinutes: z.number().nonnegative().optional(),
  totalSeconds: z.number().nonnegative().optional(),
  laps: z.number().int().positive().optional(),
  avgLapMinutes: z.number().nonnegative().optional(),
  avgLapSeconds: z.number().nonnegative().optional(),
  solveFor: z.enum(['avg_lap_time', 'total_time', 'laps']),
});

type FormValues = z.infer<typeof formSchema>;

export default function SwimmingLapTimeCalculator() {
  const [result, setResult] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      solveFor: 'avg_lap_time',
    },
  });

  const onSubmit = (values: FormValues) => {
    const totalTimeSeconds = (values.totalMinutes || 0) * 60 + (values.totalSeconds || 0);
    const avgLapTimeSeconds = (values.avgLapMinutes || 0) * 60 + (values.avgLapSeconds || 0);

    if (values.solveFor === 'avg_lap_time' && values.laps && totalTimeSeconds > 0) {
      const pacePerLap = totalTimeSeconds / values.laps;
      const paceMins = Math.floor(pacePerLap / 60);
      const paceSecs = Math.round(pacePerLap % 60);
      setResult(`${paceMins}:${paceSecs.toString().padStart(2, '0')} per lap`);
    } else if (values.solveFor === 'total_time' && values.laps && avgLapTimeSeconds > 0) {
      const totalSeconds = values.laps * avgLapTimeSeconds;
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = Math.round(totalSeconds % 60);
      setResult(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    } else if (values.solveFor === 'laps' && totalTimeSeconds > 0 && avgLapTimeSeconds > 0) {
      const laps = totalTimeSeconds / avgLapTimeSeconds;
      setResult(`${laps.toFixed(0)} laps`);
    } else {
      setResult("Please provide the required inputs to calculate.");
    }
  };

  const solveFor = form.watch('solveFor');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="solveFor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What do you want to calculate?</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="avg_lap_time">Average Lap Time</option>
                  <option value="total_time">Total Time</option>
                  <option value="laps">Number of Laps</option>
                </select>
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormLabel>Total Swim Time</FormLabel>
              <div className="grid grid-cols-2 gap-2">
                <FormField control={form.control} name="totalMinutes" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="min" {...field} disabled={solveFor === 'total_time'} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)}/></FormControl></FormItem>)} />
                <FormField control={form.control} name="totalSeconds" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="sec" {...field} disabled={solveFor === 'total_time'} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)}/></FormControl></FormItem>)} />
              </div>
            </div>
            <FormField control={form.control} name="laps" render={({ field }) => (<FormItem><FormLabel>Number of Laps</FormLabel><FormControl><Input type="number" {...field} disabled={solveFor === 'laps'} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl></FormItem>)} />
            <div>
              <FormLabel>Average Lap Time</FormLabel>
              <div className="grid grid-cols-2 gap-2">
                <FormField control={form.control} name="avgLapMinutes" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="min" {...field} disabled={solveFor === 'avg_lap_time'} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)}/></FormControl></FormItem>)} />
                <FormField control={form.control} name="avgLapSeconds" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="sec" {...field} disabled={solveFor === 'avg_lap_time'} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)}/></FormControl></FormItem>)} />
              </div>
            </div>
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Waves className="h-8 w-8 text-primary" /><CardTitle>Result</CardTitle></div></CardHeader>
            <CardContent><p className="text-3xl font-bold text-center">{result}</p></CardContent>
        </Card>
      )}
    </div>
  );
}
