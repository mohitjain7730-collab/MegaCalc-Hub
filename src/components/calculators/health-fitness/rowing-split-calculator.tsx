
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Ship, Info } from 'lucide-react';

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
              <p className="text-xs text-muted-foreground mt-1">Example: 7:00 for a 2,000 m erg test</p>
            </div>
            <div>
              <FormLabel>Average 500m Split</FormLabel>
              <div className="grid grid-cols-2 gap-2">
                <FormField control={form.control} name="splitMinutes" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="min" {...field} disabled={solveFor === 'split'} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)}/></FormControl></FormItem>)} />
                <FormField control={form.control} name="splitSeconds" render={({ field }) => (<FormItem><FormControl><Input type="number" step="0.1" placeholder="sec" {...field} disabled={solveFor === 'split'} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}/></FormControl></FormItem>)} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Your /500m pace target</p>
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

      {/* Interpretation */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Interpretation</CardTitle>
            <CardDescription>Category, takeaway, and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const v = form.getValues();
              const splitSec = (v.splitMinutes || 0) * 60 + (v.splitSeconds || 0);
              const watts = splitSec > 0 ? 2.8 / Math.pow(splitSec / 500, 3) : null;
              let category = 'Steady/technique';
              if (splitSec > 0) {
                if (splitSec <= 105) category = 'Threshold';
                else if (splitSec <= 120) category = 'Endurance';
                else category = 'Recovery/technique';
              }
              const opinion = splitSec && splitSec <= 105 ? 'Hard aerobic pace—use sparingly and recover well.' : 'Great for base fitness and technical consistency.';
              const recs = [
                'Focus on legs → body → arms sequencing to maximize watts.',
                'Use a consistent drag factor (≈110–130) for comparable splits.',
                'Blend steady state with threshold and short power intervals.'
              ];
              return (
                <div className="space-y-2">
                  <p><span className="font-semibold">Category:</span> {category}{watts ? ` (~${watts.toFixed(0)} W)` : ''}</p>
                  <p><span className="font-semibold">Takeaway:</span> {opinion}</p>
                  <ul className="list-disc ml-5 text-sm text-muted-foreground">{recs.map((r,i)=><li key={i}>{r}</li>)}</ul>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5" />
            Related Calculators
          </CardTitle>
          <CardDescription>Explore endurance tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg"><h4 className="font-semibold mb-1"><a href="/category/health-fitness/swimming-lap-time-calculator" className="text-primary hover:underline">Swimming Lap Time</a></h4><p className="text-sm text-muted-foreground">Convert total time, laps, and pace.</p></div>
            <div className="p-4 border rounded-lg"><h4 className="font-semibold mb-1"><a href="/category/health-fitness/mets-calories-burned-calculator" className="text-primary hover:underline">METs Calories Burned</a></h4><p className="text-sm text-muted-foreground">Estimate calories for rowing sessions.</p></div>
    </div>
        </CardContent>
      </Card>

      {/* Guide (minimal, editable) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Complete Guide to Rowing Splits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Use this space for your comprehensive guide on /500m split, watts, and technique.</p>
          <p>I added placeholders; you can replace them with detailed content later.</p>
        </CardContent>
      </Card>

      {/* FAQ (8-10 items, expanded) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>About rowing splits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            ['What does /500m split mean?', 'Projected time to cover 500m at your current pace.'],
            ['How do I convert split to watts?', 'Concept2 formula relates split time to power output.'],
            ['Why is my erg faster than on water?', 'Water drag, balance, and conditions slow on‑water times.'],
            ['What drag factor should I use?', 'Typically ~110–130; prioritize consistency.'],
            ['Does stroke rate control speed?', 'Power per stroke matters more; rate supports the target power.'],
            ['How often to test a 2K?', 'Every 6–8 weeks; use it to anchor training zones.'],
            ['Are intervals better than steady state?', 'Both—volume builds base; intervals raise power capacity.'],
            ['Does body weight matter?', 'Affects power‑to‑weight and boat speed, especially in crews.'],
            ['Why is pacing non‑linear?', 'Each second faster requires disproportionately higher watts.'],
            ['Can I predict other distances?', 'Yes—use known ratios to project 6k, 60‑min, and sprints.'],
          ].map(([q,a],i) => (
            <div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
