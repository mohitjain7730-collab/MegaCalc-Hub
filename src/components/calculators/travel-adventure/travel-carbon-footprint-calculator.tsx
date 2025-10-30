'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Plane, TrainFront, CarFront, Info, Globe2 } from 'lucide-react';

const formSchema = z.object({
  mode: z.enum(['flight','car','train']).optional(),
  distanceKm: z.number().min(1).optional(),
  passengers: z.number().min(1).max(10).optional(),
  carEfficiencyLper100km: z.number().min(1).max(20).optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Emission factors (kg CO2e per passenger-km)
const EF = {
  flight: 0.158, // economy average incl. non-CO2 effects (RFI)
  train: 0.041, // average electricity mix
};

export default function TravelCarbonFootprintCalculator() {
  const [result, setResult] = useState<{ totalKg: number; perPassengerKg: number; tips: string[] } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { mode: 'flight', distanceKm: undefined, passengers: undefined, carEfficiencyLper100km: 7 } });

  const calc = (v: FormValues) => {
    if (!v.mode || v.distanceKm == null || v.passengers == null) return null;
    const d = v.distanceKm;
    let totalKg = 0;
    if (v.mode === 'flight') totalKg = d * EF.flight * v.passengers;
    else if (v.mode === 'train') totalKg = d * EF.train * v.passengers;
    else {
      // Car: liters used * 2.31 kg CO2e/liter (gasoline approx.)
      const lUsed = (v.carEfficiencyLper100km || 7) * (d / 100);
      totalKg = lUsed * 2.31;
    }
    const perPassengerKg = totalKg / v.passengers;
    const tips = [
      'Pack light and choose direct routes to reduce fuel burn.',
      'Offset emissions via reputable projects after reducing first.',
      v.mode === 'car' ? 'Carpool and keep tires properly inflated.' : 'Consider rail for medium distances when possible.',
    ];
    return { totalKg, perPassengerKg, tips };
  };

  const onSubmit = (v: FormValues) => {
    const r = calc(v);
    setResult(r);
  };

  const mode = form.watch('mode');

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Leaf className="h-5 w-5" />Travel Carbon Footprint</CardTitle>
          <CardDescription>Estimate CO₂e for your trip</CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="mode" render={({ field }) => (
              <FormItem>
                <FormLabel>Mode</FormLabel>
                <FormControl>
                  <select className="border rounded h-10 px-3 w-full bg-background" value={field.value ?? ''} onChange={e => field.onChange(e.target.value as any)}>
                    <option value="flight">Flight</option>
                    <option value="car">Car</option>
                    <option value="train">Train</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="distanceKm" render={({ field }) => (
              <FormItem>
                <FormLabel>Distance (km)</FormLabel>
                <FormControl><Input type="number" step="1" placeholder="e.g., 1200" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="passengers" render={({ field }) => (
              <FormItem>
                <FormLabel>Passengers</FormLabel>
                <FormControl><Input type="number" step="1" placeholder="e.g., 1" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseInt(e.target.value,10) || undefined)} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            {mode === 'car' && (
              <FormField control={form.control} name="carEfficiencyLper100km" render={({ field }) => (
                <FormItem>
                  <FormLabel>Car Efficiency (L/100km)</FormLabel>
                  <FormControl><Input type="number" step="0.1" placeholder="e.g., 7.0" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            )}
          </div>
          <Button type="submit" className="w-full md:w-auto">Calculate Emissions</Button>
        </form>
      </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4"><Globe2 className="h-8 w-8 text-primary" /><div><CardTitle>Your Trip Emissions</CardTitle><CardDescription>Estimated CO₂e</CardDescription></div></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-primary/5 rounded-lg"><p className="text-sm text-muted-foreground mb-1">Total</p><p className="text-3xl font-bold text-primary">{result.totalKg.toFixed(1)} kg</p></div>
              <div className="text-center p-6 bg-muted/50 rounded-lg"><p className="text-sm text-muted-foreground mb-1">Per Passenger</p><p className="text-2xl font-bold">{result.perPassengerKg.toFixed(1)} kg</p></div>
              <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg"><p className="text-sm text-muted-foreground mb-1">Suggestions</p><p className="text-sm">{result.tips[0]}</p></div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Plane className="h-5 w-5" />Related Calculators</CardTitle>
            <CardDescription>Plan smarter travel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a className="text-primary hover:underline" href="/category/time-date/world-time-zone-converter">World Time Zone Converter</a></h4><p className="text-sm text-muted-foreground">Convert times between regions quickly.</p></div>
              <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a className="text-primary hover:underline" href="/category/travel-adventure/travel-budget-estimator">Travel Budget Estimator</a></h4><p className="text-sm text-muted-foreground">Estimate total trip costs.</p></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Leaf className="h-5 w-5" />Complete Guide to Travel Emissions</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>This is a sample line for the complete guide section. You can add your detailed content here.</p>
            <p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle>
            <CardDescription>About carbon footprints</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              ['What factors drive flight emissions?', 'Distance, aircraft type, occupancy, and seat class (economy is lowest per passenger).'],
              ['Do layovers increase emissions?', 'Yes—takeoffs/landings add fuel burn. Nonstop routes usually emit less.'],
              ['How accurate is this estimate?', 'It uses average factors. Actual values depend on carrier, equipment, and load.'],
              ['What about non‑CO₂ effects?', 'High‑altitude effects are included via a multiplier (RFI) in the flight factor.'],
              ['How can I reduce my footprint?', 'Prefer rail for medium distances, pack light, choose efficient airlines, and offset after reducing.'],
              ['Does carpooling help?', 'Yes, splitting total emissions across passengers lowers per‑person impact.'],
              ['Electric cars?', 'If powered by clean electricity, emissions can be much lower; this simple model focuses on fuel cars.'],
              ['Are trains always greener?', 'Usually per passenger—especially on electric networks with clean grids.'],
            ].map(([q,a],i)=> (<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


