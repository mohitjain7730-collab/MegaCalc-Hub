
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Timer } from 'lucide-react';

const formSchema = z.object({
  distance: z.number().positive().optional(),
  hours: z.number().nonnegative().optional(),
  minutes: z.number().nonnegative().optional(),
  seconds: z.number().nonnegative().optional(),
  paceMinutes: z.number().nonnegative().optional(),
  paceSeconds: z.number().nonnegative().optional(),
  solveFor: z.enum(['pace', 'time', 'distance']),
});

type FormValues = z.infer<typeof formSchema>;

export default function RunningPaceCalculator() {
  const [result, setResult] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      solveFor: 'pace',
    },
  });

  const onSubmit = (values: FormValues) => {
    const totalTimeSeconds = (values.hours || 0) * 3600 + (values.minutes || 0) * 60 + (values.seconds || 0);
    const paceSeconds = (values.paceMinutes || 0) * 60 + (values.paceSeconds || 0);

    if (values.solveFor === 'pace' && values.distance && totalTimeSeconds > 0) {
      const pacePerUnit = totalTimeSeconds / values.distance;
      const paceMins = Math.floor(pacePerUnit / 60);
      const paceSecs = Math.round(pacePerUnit % 60);
      setResult(`${paceMins}:${paceSecs.toString().padStart(2, '0')} per unit`);
    } else if (values.solveFor === 'time' && values.distance && paceSeconds > 0) {
      const totalSeconds = values.distance * paceSeconds;
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = Math.round(totalSeconds % 60);
      setResult(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    } else if (values.solveFor === 'distance' && totalTimeSeconds > 0 && paceSeconds > 0) {
      const distance = totalTimeSeconds / paceSeconds;
      setResult(`${distance.toFixed(2)} units`);
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
                  <option value="pace">Pace</option>
                  <option value="time">Time</option>
                  <option value="distance">Distance</option>
                </select>
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="distance" render={({ field }) => (<FormItem><FormLabel>Distance</FormLabel><FormControl><Input type="number" {...field} disabled={solveFor === 'distance'} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl></FormItem>)} />
            <div>
              <FormLabel>Time</FormLabel>
              <div className="grid grid-cols-3 gap-2">
                <FormField control={form.control} name="hours" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="h" {...field} disabled={solveFor === 'time'} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)}/></FormControl></FormItem>)} />
                <FormField control={form.control} name="minutes" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="m" {...field} disabled={solveFor === 'time'} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)}/></FormControl></FormItem>)} />
                <FormField control={form.control} name="seconds" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="s" {...field} disabled={solveFor === 'time'} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)}/></FormControl></FormItem>)} />
              </div>
            </div>
            <div>
              <FormLabel>Pace</FormLabel>
              <div className="grid grid-cols-2 gap-2">
                <FormField control={form.control} name="paceMinutes" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="min" {...field} disabled={solveFor === 'pace'} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)}/></FormControl></FormItem>)} />
                <FormField control={form.control} name="paceSeconds" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="sec" {...field} disabled={solveFor === 'pace'} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)}/></FormControl></FormItem>)} />
              </div>
            </div>
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Timer className="h-8 w-8 text-primary" /><CardTitle>Result</CardTitle></div></CardHeader>
            <CardContent><p className="text-3xl font-bold text-center">{result}</p></CardContent>
        </Card>
      )}
    </div>
  );
}
