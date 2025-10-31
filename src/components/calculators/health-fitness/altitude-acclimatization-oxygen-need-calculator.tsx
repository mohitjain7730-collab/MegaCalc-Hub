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
import { Zap } from 'lucide-react';

const formSchema = z.object({
  altitudeMeters: z.number().min(0).max(6000).optional(),
  baselineVo2RequirementMlMinKg: z.number().positive('Enter baseline oxygen need').optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AltitudeAcclimatizationOxygenNeedCalculator() {
  const [result, setResult] = useState<{ adjustedNeed: number; factor: number; interpretation: string; opinion: string } | null>(null);

  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { altitudeMeters: undefined, baselineVo2RequirementMlMinKg: undefined } });

  const calculate = (v: FormValues) => {
    if (v.altitudeMeters == null || v.baselineVo2RequirementMlMinKg == null) return null;
    // Simplified inspired O2 drop: factor increases ~2% per 300m above 1500m
    const extra = Math.max(0, v.altitudeMeters - 1500);
    const increments = extra / 300 * 0.02;
    const factor = 1 + Math.max(0, increments);
    const adjusted = v.baselineVo2RequirementMlMinKg * factor;
    return { adjusted, factor };
  };

  const interpret = (factor: number) => {
    if (factor > 1.2) return 'Significant increase in oxygen requirement—acclimatization and pacing are crucial.';
    if (factor >= 1.05) return 'Mild to moderate increase—expect elevated breathing and HR.';
    return 'Minimal change at this altitude.';
  };

  const opinion = (factor: number) => {
    if (factor > 1.2) return 'Plan staged ascent, lighter intensities, and increased recovery between sessions.';
    if (factor >= 1.05) return 'Allow extra warm-up, hydrate well, and adjust pacing by feel and HR.';
    return 'Proceed with normal training while monitoring how you feel.';
  };

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    if (!res) { setResult(null); return; }
    setResult({
      adjustedNeed: Math.round(res.adjusted * 100) / 100,
      factor: Math.round(res.factor * 100) / 100,
      interpretation: interpret(res.factor),
      opinion: opinion(res.factor),
    });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="altitudeMeters" render={({ field }) => (
              <FormItem>
                <FormLabel>Altitude (meters)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 2500" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="baselineVo2RequirementMlMinKg" render={({ field }) => (
              <FormItem>
                <FormLabel>Baseline O2 Need (ml/kg/min)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 30" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Adjust for Altitude</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Adjusted Oxygen Requirement</CardTitle>
              </div>
              <CardDescription>Factor due to altitude: ×{result.factor}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold text-primary">{result.adjustedNeed} ml/kg/min</p>
              <p className="text-muted-foreground">{result.interpretation}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Our Opinion</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">{result.opinion}</p></CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Connect altitude to physiology</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/vo2-max-calculator" className="text-primary hover:underline">VO₂ Max Calculator</Link></h4><p className="text-sm text-muted-foreground">Aerobic ceiling at sea level.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/red-blood-cell-count-effect-on-vo2-max-calculator" className="text-primary hover:underline">RBC → VO₂ Max</Link></h4><p className="text-sm text-muted-foreground">Hematology effects.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/capillary-density-estimator" className="text-primary hover:underline">Capillary Density</Link></h4><p className="text-sm text-muted-foreground">Diffusion capacity.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/myoglobin-oxygen-storage-calculator" className="text-primary hover:underline">Myoglobin O₂ Storage</Link></h4><p className="text-sm text-muted-foreground">Intramuscular reserve.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Training at Altitude</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>This is a sample line for the complete guide section. You can add your detailed content here.</p>
          <p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Answers for athletes planning elevation training</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            ['How does altitude affect oxygen need?', 'Reduced barometric pressure lowers inspired O₂, increasing the relative oxygen requirement to sustain the same workload.'],
            ['How quickly should I ascend?', 'Increase sleeping altitude gradually and schedule easy days to allow ventilatory and hematological adaptation.'],
            ['Should I train by pace at altitude?', 'Use heart rate and RPE rather than sea‑level paces, which are often unattainable initially.'],
            ['Does hydration matter more?', 'Yes, dry air and increased ventilation increase fluid loss; monitor body mass and urine color.'],
            ['Will VO₂ Max change after acclimatization?', 'It may remain lower at altitude but economy and tolerance improve, reducing perceived effort.'],
            ['What about iron status?', 'Adequate iron is critical for erythropoiesis; consider screening before extended altitude blocks.'],
            ['Is this medical advice?', 'No—this calculator is educational and not a substitute for personalized medical guidance.'],
            ['How accurate is the factor?', 'It is a simplified heuristic based on altitude bands; individual responses vary widely.'],
          ].map(([q,a],i)=> (<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}
        </CardContent>
      </Card>
    </div>
  );
}


