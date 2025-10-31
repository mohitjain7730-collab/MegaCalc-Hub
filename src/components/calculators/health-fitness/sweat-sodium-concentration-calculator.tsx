'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Zap, Droplets, Beaker, Calendar } from 'lucide-react';

const formSchema = z.object({
  sweatVolumeLiters: z.number().min(0.1).max(5).optional(),
  sodiumLostMg: z.number().min(100).max(20000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SweatSodiumConcentrationCalculator() {
  const [result, setResult] = useState<{ sodiumMgPerL: number; interpretation: string; recommendations: string[]; warnings: string[]; plan: { week: number; focus: string }[] } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { sweatVolumeLiters: undefined, sodiumLostMg: undefined } });

  const calculate = (v: FormValues) => {
    if (v.sweatVolumeLiters == null || v.sodiumLostMg == null) return null;
    const conc = v.sodiumLostMg / v.sweatVolumeLiters; // mg/L
    return Math.round(conc);
  };

  const interpret = (mgL: number) => {
    if (mgL >= 1500) return 'Very salty sweater—high sodium replacement may be needed.';
    if (mgL >= 800) return 'Moderate sodium loss—consider targeted electrolyte intake.';
    return 'Lower sodium loss—standard hydration strategies may suffice.';
  };

  const recs = (mgL: number) => {
    if (mgL >= 1500) return ['Use high‑sodium drink mixes (800–1200 mg/L) in heat', 'Monitor cramps and heat stress; pre‑hydrate appropriately'];
    if (mgL >= 800) return ['Add electrolytes on sessions >60–90 min', 'Adjust sodium by climate and sweat rate'];
    return ['Hydrate to thirst; add light electrolytes on hot days', 'Track body mass changes to refine fluid targets'];
  };
  const warns = () => ['Avoid over‑drinking plain water during long events', 'Watch for hyponatremia signs (nausea, confusion, swelling)', 'Personalize with repeated field tests'];
  const plan = () => ([
    { week: 1, focus: 'Baseline sweat rate test in typical conditions' },
    { week: 2, focus: 'Trial electrolyte dose on long session' },
    { week: 3, focus: 'Adjust sodium by body‑mass loss and symptoms' },
    { week: 4, focus: 'Heat‑acclimation block; monitor response' },
    { week: 5, focus: 'Refine pre‑hydration and mid‑session strategy' },
    { week: 6, focus: 'Race simulation; validate fueling/hydration' },
    { week: 7, focus: 'Fine‑tune based on climate forecast' },
    { week: 8, focus: 'Execute plan; post‑event review' },
  ]);

  const onSubmit = (values: FormValues) => {
    const conc = calculate(values);
    if (conc == null) { setResult(null); return; }
    setResult({ sodiumMgPerL: conc, interpretation: interpret(conc), recommendations: recs(conc), warnings: warns(), plan: plan() });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Droplets className="h-5 w-5" /> Sweat Sodium Concentration</CardTitle>
          <CardDescription>Estimate sodium mg per liter of sweat</CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="sweatVolumeLiters" render={({ field }) => (
              <FormItem>
                <FormLabel>Sweat Volume (L)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 1.2" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="sodiumLostMg" render={({ field }) => (
              <FormItem>
                <FormLabel>Sodium Lost (mg)</FormLabel>
                <FormControl>
                  <Input type="number" step="10" placeholder="e.g., 1200" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit" className="w-full md:w-auto">Estimate Sodium Concentration</Button>
        </form>
      </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Sweat Sodium Concentration</CardTitle>
              </div>
              <CardDescription>Calculated as mg per liter</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-6 bg-primary/5 rounded-lg"><p className="text-sm text-muted-foreground mb-1">Concentration</p><p className="text-3xl font-bold text-primary">{result.sodiumMgPerL} mg/L</p></div>
              <p className="text-sm">{result.interpretation}</p>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card><CardHeader><CardTitle>Recommendations</CardTitle></CardHeader><CardContent><ul className="space-y-2">{result.recommendations.map((r,i)=>(<li key={i} className="text-sm text-muted-foreground">{r}</li>))}</ul></CardContent></Card>
            <Card><CardHeader><CardTitle>Warning Signs</CardTitle></CardHeader><CardContent><ul className="space-y-2">{result.warnings.map((w,i)=>(<li key={i} className="text-sm text-muted-foreground">{w}</li>))}</ul></CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Plan</CardTitle></CardHeader>
            <CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left p-2">Week</th><th className="text-left p-2">Focus</th></tr></thead><tbody>{result.plan.map(p=> (<tr key={p.week} className="border-b"><td className="p-2">{p.week}</td><td className="p-2">{p.focus}</td></tr>))}</tbody></table></div></CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Related Calculators</CardTitle><CardDescription>Hydration & fueling</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/hydration-sweat-rate-calculator" className="text-primary hover:underline">Sweat Rate</Link></h4><p className="text-sm text-muted-foreground">Fluid needs by conditions.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/electrolyte-replacement-calculator" className="text-primary hover:underline">Electrolyte Replacement</Link></h4><p className="text-sm text-muted-foreground">Sodium intake planning.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/heat-stress-risk-calculator" className="text-primary hover:underline">Heat Stress Risk</Link></h4><p className="text-sm text-muted-foreground">Environment safety.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/recovery-heart-rate-calculator" className="text-primary hover:underline">Recovery Heart Rate</Link></h4><p className="text-sm text-muted-foreground">Monitor recovery.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Hydration & Electrolytes</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>This is a sample line for the complete guide section. You can add your detailed content here.</p><p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Frequently Asked Questions</CardTitle><CardDescription>Detailed, SEO‑oriented answers</CardDescription></CardHeader>
        <CardContent className="space-y-4">{[
          ['Why does sodium concentration matter?', 'It helps personalize electrolyte intake to prevent cramps, maintain performance, and reduce hyponatremia risk.'],
          ['Is higher sodium always better?', 'No. Match intake to losses and duration; over‑consumption can cause GI issues or fluid retention.'],
          ['How to measure sweat volume?', 'Use pre/post‑workout body mass change adjusted for drinks/urine to estimate liters lost.'],
          ['Do I need lab testing?', 'Field tests are often enough; lab testing can refine plans for extreme heat or ultra‑endurance.'],
          ['How often to retest?', 'Seasonally and when climate or training load changes.'],
          ['Can caffeine affect hydration?', 'Caffeine has mild diuretic effects in non‑habitual users; overall hydration depends on total fluids and sodium.'],
          ['What are hyponatremia signs?', 'Headache, nausea, confusion, swelling of hands/feet—stop and seek medical help.'],
        ].map(([q,a],i)=> (<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}</CardContent>
      </Card>
    </div>
  );
}


