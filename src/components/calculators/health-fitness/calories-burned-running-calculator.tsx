
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Flame, Info } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const metValues = {
  '6': 9.8, // 10:00 min/mile
  '7.5': 11.8, // 8:00 min/mile
  '10': 16, // 6:00 min/mile
};

const formSchema = z.object({
  bodyWeight: z.number().positive(),
  duration: z.number().positive(),
  speed: z.string(),
  unit: z.enum(['kg', 'lbs']),
});

type FormValues = z.infer<typeof formSchema>;

export default function CaloriesBurnedRunningCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bodyWeight: undefined,
      duration: undefined,
      speed: '6',
      unit: 'lbs',
    },
  });

  const onSubmit = (values: FormValues) => {
    let weightKg = values.bodyWeight;
    if (values.unit === 'lbs') {
      weightKg *= 0.453592;
    }
    const met = metValues[values.speed as keyof typeof metValues];
    const calories = (met * weightKg * 3.5 / 200) * values.duration;
    setResult(calories);
  };
  
  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="bodyWeight" render={({ field }) => (<FormItem><FormLabel>Body Weight ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}/></FormControl><p className="text-xs text-muted-foreground">Will auto-convert lbs → kg for the formula</p><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="duration" render={({ field }) => (<FormItem><FormLabel>Running Duration (minutes)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}/></FormControl><p className="text-xs text-muted-foreground">Example: 30–60 minutes</p><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="speed" render={({ field }) => (
                <FormItem><FormLabel>Running Speed</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="6">6 mph (10:00 min/mile)</SelectItem>
                        <SelectItem value="7.5">7.5 mph (8:00 min/mile)</SelectItem>
                        <SelectItem value="10">10 mph (6:00 min/mile)</SelectItem>
                    </SelectContent>
                </Select></FormItem>
            )} />
            <FormField control={form.control} name="unit" render={({ field }) => (<FormItem><FormLabel>Weight Unit</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="kg">kg</SelectItem><SelectItem value="lbs">lbs</SelectItem></SelectContent></Select></FormItem>)} />
          </div>
          <Button type="submit">Calculate Calories</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Flame className="h-8 w-8 text-primary" /><CardTitle>Estimated Calories Burned</CardTitle></div></CardHeader>
            <CardContent><p className="text-3xl font-bold text-center">{result.toFixed(0)} kcal</p></CardContent>
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
              // Rough intensity inference using calories per minute
              const calsPerMin = result / (form.getValues().duration || 1);
              let category = 'Light session';
              if (calsPerMin >= 8 && calsPerMin < 12) category = 'Moderate session';
              if (calsPerMin >= 12) category = 'Vigorous session';
              const opinion = calsPerMin >= 12 ? 'High energy cost—ensure fueling and allow recovery.' : calsPerMin >= 8 ? 'Solid aerobic stimulus—consider tempo work for variety.' : 'Easy effort—great for base building and active recovery.';
              const recs = [
                'Match fueling to intensity (carbs for vigorous/longer sessions).',
                'Hydrate and replace electrolytes in heat/humidity.',
                'Rotate speeds and terrain to reduce overuse risk.'
              ];
              return (
                <div className="space-y-2">
                  <p><span className="font-semibold">Category:</span> {category} ({calsPerMin.toFixed(1)} kcal/min)</p>
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
            <Flame className="h-5 w-5" />
            Related Calculators
          </CardTitle>
          <CardDescription>Explore running performance tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg"><h4 className="font-semibold mb-1"><a href="/category/health-fitness/running-pace-calculator" className="text-primary hover:underline">Running Pace Calculator</a></h4><p className="text-sm text-muted-foreground">Convert pace, time, and distance.</p></div>
            <div className="p-4 border rounded-lg"><h4 className="font-semibold mb-1"><a href="/category/health-fitness/mets-calories-burned-calculator" className="text-primary hover:underline">METs Calories Burned</a></h4><p className="text-sm text-muted-foreground">Estimate calories for many activities.</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Guide (minimal, editable) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Complete Guide to Running Calories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Use this space for your comprehensive guide on METs, body weight, and duration.</p>
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
          <CardDescription>About calorie estimation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            ['What factors drive calories burned?', 'Primarily body weight, speed (METs), and duration.'],
            ['Is the estimate exact?', 'No—terrain, wind, and efficiency cause variation.'],
            ['Do hills change the result?', 'Yes—uphill raises and downhill lowers actual burn.'],
            ['Does running form matter?', 'Better economy can reduce energy cost at a given speed.'],
            ['Which unit should I use?', 'Use kg for metric; lbs will be converted to kg in the formula.'],
            ['How can I validate?', 'Compare with HR-based devices over multiple runs.'],
            ['Are treadmills different?', 'Slightly—grade and calibration influence energy cost.'],
            ['Does temperature matter?', 'Heat can increase cardiovascular strain and perceived effort.'],
            ['Can I use this for walking?', 'Use METs appropriate to walking speeds for accuracy.'],
            ['Why METs choices are limited?', 'Representative speeds shown; real-world varies continuously.'],
          ].map(([q,a],i) => (
            <div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
