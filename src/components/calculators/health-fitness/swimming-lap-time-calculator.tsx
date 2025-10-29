
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Waves, Info } from 'lucide-react';

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
              <p className="text-xs text-muted-foreground mt-1">Example: 30:00 for a long swim</p>
            </div>
            <FormField control={form.control} name="laps" render={({ field }) => (<FormItem><FormLabel>Number of Laps</FormLabel><FormControl><Input type="number" {...field} disabled={solveFor === 'laps'} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl></FormItem>)} />
            <div>
              <FormLabel>Average Lap Time</FormLabel>
              <div className="grid grid-cols-2 gap-2">
                <FormField control={form.control} name="avgLapMinutes" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="min" {...field} disabled={solveFor === 'avg_lap_time'} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)}/></FormControl></FormItem>)} />
                <FormField control={form.control} name="avgLapSeconds" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="sec" {...field} disabled={solveFor === 'avg_lap_time'} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)}/></FormControl></FormItem>)} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Pace per lap (your pool’s lap definition)</p>
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

      {/* Interpretation */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Interpretation</CardTitle>
            <CardDescription>Category, takeaway, and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const values = form.getValues();
              const pacePerLapSec = (values.avgLapMinutes || 0) * 60 + (values.avgLapSeconds || 0);
              let category = 'Technique focus';
              if (pacePerLapSec > 0) {
                if (pacePerLapSec <= 90) category = 'Threshold/tempo pace';
                else if (pacePerLapSec <= 110) category = 'Endurance pace';
                else category = 'Easy technique pace';
              }
              const opinion = pacePerLapSec && pacePerLapSec <= 90 ? 'Challenging aerobic pace—build with CSS sets.' : 'Great for aerobic base and form consistency.';
              const recs = [
                'Use consistent splits; avoid starting too fast.',
                'Include technique drills to improve DPS and SWOLF.',
                'Test CSS every 4–8 weeks to recalibrate training.'
              ];
              return (
                <div className="space-y-2">
                  <p><span className="font-semibold">Category:</span> {category}{pacePerLapSec ? ` (${Math.floor(pacePerLapSec/60)}:${String(Math.round(pacePerLapSec%60)).padStart(2,'0')} / lap)` : ''}</p>
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
            <Waves className="h-5 w-5" />
            Related Calculators
          </CardTitle>
          <CardDescription>Explore swim and endurance tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg"><h4 className="font-semibold mb-1"><a href="/category/health-fitness/rowing-split-calculator" className="text-primary hover:underline">Rowing Split Calculator</a></h4><p className="text-sm text-muted-foreground">Compute /500m pace and distance.</p></div>
            <div className="p-4 border rounded-lg"><h4 className="font-semibold mb-1"><a href="/category/health-fitness/mets-calories-burned-calculator" className="text-primary hover:underline">METs Calories Burned</a></h4><p className="text-sm text-muted-foreground">Estimate calories for swim sessions.</p></div>
    </div>
        </CardContent>
      </Card>

      {/* Guide (minimal, editable) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Complete Guide to Swimming Pace
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Use this space for your comprehensive guide on lap time, CSS, and training.</p>
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
          <CardDescription>About swimming pace</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            ['What’s a lap vs. a length?', 'Terminology varies; many use “lap” to mean down-and-back.'],
            ['How do I use pace per 100?', 'Normalize sessions to compare workouts across distances.'],
            ['What is CSS?', 'Critical Swim Speed—sustainable aerobic pace anchor.'],
            ['How often to retest CSS?', 'Every 4–8 weeks using consistent protocols.'],
            ['Does pool size matter?', 'Yes—SCY, SCM, and LCM times aren’t directly comparable.'],
            ['Do technique changes affect pace?', 'Yes—efficiency (DPS, SWOLF) strongly affects speed.'],
            ['How should I pace intervals?', 'Target a narrow range around CSS for threshold sets.'],
            ['Can wearables track CSS?', 'Some estimate pace trends; use manual tests for accuracy.'],
            ['Why is my open-water pace slower?', 'Sighting, currents, and lack of walls reduce speed.'],
            ['What drills help most?', 'Catch-up, sculling, and single-arm for better DPS.'],
          ].map(([q,a],i) => (
            <div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
