
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Timer, Info } from 'lucide-react';

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
                <p className="text-xs text-muted-foreground">Choose the unknown; provide the other two</p>
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
              <p className="text-xs text-muted-foreground mt-1">Example: 0:25:00 for 5 km</p>
            </div>
            <div>
              <FormLabel>Pace</FormLabel>
              <div className="grid grid-cols-2 gap-2">
                <FormField control={form.control} name="paceMinutes" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="min" {...field} disabled={solveFor === 'pace'} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)}/></FormControl></FormItem>)} />
                <FormField control={form.control} name="paceSeconds" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="sec" {...field} disabled={solveFor === 'pace'} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)}/></FormControl></FormItem>)} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Pace per unit distance (e.g., min/km)</p>
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

      {/* Interpretation */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Interpretation</CardTitle>
            <CardDescription>Category, takeaway, and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const mode = solveFor;
              const tips = mode === 'pace'
                ? ['Use this pace for race simulations and tempo runs.', 'Convert to training zones using % of 5K/10K pace.']
                : mode === 'time'
                ? ['Break total time into even splits; avoid fast starts.', 'Account for terrain and heat—pace by effort on hills.']
                : ['Increase distance gradually (no more than ~10% weekly).', 'Align long run distance with goal event timing.'];
              const takeaway = mode === 'pace' ? 'Target pace calculated—anchor training zones and fueling.' : mode === 'time' ? 'Projected finish time—plan race strategy and splits.' : 'Estimated distance—use for route planning or treadmill sessions.';
              return (
                <div className="space-y-2">
                  <p><span className="font-semibold">Takeaway:</span> {takeaway}</p>
                  <ul className="list-disc ml-5 text-sm text-muted-foreground">{tips.map((t,i)=><li key={i}>{t}</li>)}</ul>
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
            <Timer className="h-5 w-5" />
            Related Calculators
          </CardTitle>
          <CardDescription>Explore running tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg"><h4 className="font-semibold mb-1"><a href="/category/health-fitness/vo2-max-calculator" className="text-primary hover:underline">VO₂ Max Calculator</a></h4><p className="text-sm text-muted-foreground">Estimate aerobic fitness.</p></div>
            <div className="p-4 border rounded-lg"><h4 className="font-semibold mb-1"><a href="/category/health-fitness/calories-burned-running-calculator" className="text-primary hover:underline">Running Calories Burned</a></h4><p className="text-sm text-muted-foreground">Estimate calories at different speeds.</p></div>
    </div>
        </CardContent>
      </Card>

      {/* Guide (minimal, editable) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Complete Guide to Running Pace
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Use this space for your comprehensive guide on pacing strategy and training zones.</p>
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
          <CardDescription>About pacing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            ['What is pace versus speed?', 'Pace is time per distance; speed is distance per time.'],
            ['How do I predict race time?', 'Use recent race results and equivalent pace calculations.'],
            ['What if conditions are hot?', 'Slow down 10–30 sec/mile to manage heat and HR.'],
            ['Should I train by heart rate or pace?', 'Both work; combine pace targets with HR/RPE for context.'],
            ['How often to test pace?', 'Every 4–8 weeks or after a race/benchmark workout.'],
            ['What is a negative split?', 'Running the second half slightly faster than the first.'],
            ['Do hills change the plan?', 'Yes—run by effort/HR on hills, not strict pace.'],
            ['Can strength training help pace?', 'Yes—improves economy and reduces injury risk.'],
            ['How do I choose training zones?', 'Base on recent performance or VO₂ max estimation.'],
            ['Best way to improve?', 'Consistency: easy volume, threshold work, and intervals.'],
          ].map(([q,a],i) => (
            <div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
