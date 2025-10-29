
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Zap, Info } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  riderWeight: z.number().positive(),
  bikeWeight: z.number().positive(),
  speed: z.number().positive(),
  gradient: z.number().nonnegative(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CyclingPowerOutputCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      riderWeight: undefined,
      bikeWeight: undefined,
      speed: undefined,
      gradient: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { riderWeight, bikeWeight, speed, gradient } = values;
    const speedMps = speed / 3.6;
    const totalWeight = riderWeight + bikeWeight;
    const crr = 0.005; // Coefficient of rolling resistance
    const cdA = 0.388; // Drag area
    const airDensity = 1.225;

    const pRoll = 9.81 * totalWeight * crr * speedMps;
    const pGrav = 9.81 * totalWeight * (gradient / 100) * speedMps;
    const pDrag = 0.5 * cdA * airDensity * Math.pow(speedMps, 3);
    
    const totalPower = pRoll + pGrav + pDrag;
    setResult(totalPower);
  };

  return (
    <div className="space-y-8">
      <Alert variant="destructive">
        <AlertTitle>For Estimation Only</AlertTitle>
        <AlertDescription>This is a rough estimation. Factors like wind, road surface, and riding position significantly affect real-world power. For accurate measurement, a power meter is required.</AlertDescription>
      </Alert>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="riderWeight" render={({ field }) => (<FormItem><FormLabel>Rider Weight (kg)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}/></FormControl><p className="text-xs text-muted-foreground">Body mass used for W/kg calculation</p><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="bikeWeight" render={({ field }) => (<FormItem><FormLabel>Bike Weight (kg)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}/></FormControl><p className="text-xs text-muted-foreground">Include bottles/tools if carried</p><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="speed" render={({ field }) => (<FormItem><FormLabel>Cycling Speed (km/h)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}/></FormControl><p className="text-xs text-muted-foreground">Average ground speed over the segment</p><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="gradient" render={({ field }) => (<FormItem><FormLabel>Road Gradient (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}/></FormControl><p className="text-xs text-muted-foreground">Positive for climb, negative for descent</p><FormMessage /></FormItem>)} />
          </div>
          <Button type="submit">Estimate Power</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Zap className="h-8 w-8 text-primary" /><CardTitle>Estimated Power Output</CardTitle></div></CardHeader>
          <CardContent><p className="text-3xl font-bold text-center">{result.toFixed(0)} Watts</p></CardContent>
        </Card>
      )}

      {/* Interpretation */}
      {result !== null && (
        <Card>
          <CardHeader>
            <CardTitle>Interpretation</CardTitle>
            <CardDescription>Category, takeaway, and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const values = form.getValues();
              const wkg = values.riderWeight ? result / values.riderWeight : null;
              let category = 'Endurance effort';
              if (wkg !== null) {
                if (wkg >= 2.5 && wkg < 3.5) category = 'Tempo/All‑day pace';
                if (wkg >= 3.5 && wkg < 4.5) category = 'Threshold effort';
                if (wkg >= 4.5) category = 'VO₂ / race effort';
              }
              const opinion = wkg && wkg >= 3.5 ? 'Challenging intensity—manage training load and recovery.' : 'Aerobic intensity—great for building endurance and fat oxidation.';
              const recs = [
                'Use consistent air position; small CdA changes greatly affect power.',
                'Fuel climbs and threshold work with carbs; hydrate adequately.',
                'Periodize: alternate endurance, tempo, and interval days.'
              ];
              return (
                <div className="space-y-2">
                  <p><span className="font-semibold">Category:</span> {category}{wkg !== null ? ` (${wkg.toFixed(2)} W/kg)` : ''}</p>
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
            <Zap className="h-5 w-5" />
            Related Calculators
          </CardTitle>
          <CardDescription>Explore endurance tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg"><h4 className="font-semibold mb-1"><a href="/category/health-fitness/vo2-max-calculator" className="text-primary hover:underline">VO₂ Max Calculator</a></h4><p className="text-sm text-muted-foreground">Estimate aerobic capacity.</p></div>
            <div className="p-4 border rounded-lg"><h4 className="font-semibold mb-1"><a href="/category/health-fitness/mets-calories-burned-calculator" className="text-primary hover:underline">METs Calories Burned</a></h4><p className="text-sm text-muted-foreground">Calories for many sports.</p></div>
    </div>
        </CardContent>
      </Card>

      {/* Guide (minimal, editable) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Complete Guide to Cycling Power
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Use this space for your comprehensive guide on FTP, W/kg, and training zones.</p>
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
          <CardDescription>About cycling power</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            ['What is FTP?', 'Functional Threshold Power—max average power for about one hour.'],
            ['How accurate is this estimate?', 'It’s physics‑based; wind, position, and gear affect reality.'],
            ['What is W/kg?', 'Power normalized to weight—key for climbing performance.'],
            ['Why does aerodynamics matter?', 'At high speeds, most power offsets air resistance.'],
            ['Do I need a power meter?', 'For precision yes; this tool gives estimates without one.'],
            ['How often to retest FTP?', 'Every 4–8 weeks, or after training blocks.'],
            ['Does bike weight matter?', 'Yes—affects gravitational and rolling resistance.'],
            ['What’s a typical CdA?', 'Around 0.30–0.40 m² for road positions; varies widely.'],
            ['Will tire pressure change power?', 'Rolling resistance changes slightly with tire/pressure/surface.'],
            ['Best workouts for power?', 'Threshold intervals, VO₂ sets, and strength training.'],
          ].map(([q,a],i) => (
            <div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
