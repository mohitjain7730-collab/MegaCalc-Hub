
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ship } from 'lucide-react';

const formSchema = z.object({
  distance: z.number().positive().optional(),
  totalHours: z.number().nonnegative().optional(),
  totalMinutes: z.number().nonnegative().optional(),
  totalSeconds: z.number().nonnegative().optional(),
  splitMinutes: z.number().nonnegative().optional(),
  splitSeconds: z.number().nonnegative().optional(),
  solveFor: z.enum(['split', 'time', 'distance']),
});

type FormValues = z.infer<typeof formSchema>;

export default function RowingSplitCalculator() {
  const [result, setResult] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      solveFor: 'split',
    },
  });

  const onSubmit = (values: FormValues) => {
    const totalTimeSeconds = (values.totalHours || 0) * 3600 + (values.totalMinutes || 0) * 60 + (values.totalSeconds || 0);
    const splitTimeSeconds = (values.splitMinutes || 0) * 60 + (values.splitSeconds || 0);

    if (values.solveFor === 'split' && values.distance && totalTimeSeconds > 0) {
      const avgSplit = (totalTimeSeconds / values.distance) * 500;
      const mins = Math.floor(avgSplit / 60);
      const secs = (avgSplit % 60).toFixed(1);
      setResult(`${mins}:${secs.padStart(4, '0')}`);
    } else if (values.solveFor === 'time' && values.distance && splitTimeSeconds > 0) {
      const totalSeconds = (splitTimeSeconds / 500) * values.distance;
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = Math.round(totalSeconds % 60);
      setResult(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    } else if (values.solveFor === 'distance' && totalTimeSeconds > 0 && splitTimeSeconds > 0) {
      const distance = (totalTimeSeconds * 500) / splitTimeSeconds;
      setResult(`${distance.toFixed(0)} meters`);
    } else {
      setResult("Please provide the required inputs.");
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
                  <option value="split">Average 500m Split</option>
                  <option value="time">Total Time</option>
                  <option value="distance">Total Distance</option>
                </select>
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="distance" render={({ field }) => (<FormItem><FormLabel>Distance (meters)</FormLabel><FormControl><Input type="number" {...field} disabled={solveFor === 'distance'} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}/></FormControl></FormItem>)} />
            <div>
              <FormLabel>Total Time</FormLabel>
              <div className="grid grid-cols-3 gap-2">
                <FormField control={form.control} name="totalHours" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="h" {...field} disabled={solveFor === 'time'} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)}/></FormControl></FormItem>)} />
                <FormField control={form.control} name="totalMinutes" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="m" {...field} disabled={solveFor === 'time'} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)}/></FormControl></FormItem>)} />
                <FormField control={form.control} name="totalSeconds" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="s" {...field} disabled={solveFor === 'time'} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)}/></FormControl></FormItem>)} />
              </div>
            </div>
            <div>
              <FormLabel>Average 500m Split</FormLabel>
              <div className="grid grid-cols-2 gap-2">
                <FormField control={form.control} name="splitMinutes" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="min" {...field} disabled={solveFor === 'split'} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)}/></FormControl></FormItem>)} />
                <FormField control={form.control} name="splitSeconds" render={({ field }) => (<FormItem><FormControl><Input type="number" step="0.1" placeholder="sec" {...field} disabled={solveFor === 'split'} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}/></FormControl></FormItem>)} />
              </div>
            </div>
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Ship className="h-8 w-8 text-primary" /><CardTitle>Result</CardTitle></div></CardHeader>
            <CardContent><p className="text-3xl font-bold text-center">{result}</p></CardContent>
        </Card>
      )}
    </div>
  );
}
