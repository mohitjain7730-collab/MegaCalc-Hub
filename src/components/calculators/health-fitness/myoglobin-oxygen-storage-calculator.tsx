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

// Myoglobin stores ~1 O2 per molecule. Use mg/g of muscle and muscle mass estimate.
const formSchema = z.object({
  bodyMassKg: z.number().min(20).max(200).optional(),
  bodyFatPercent: z.number().min(3).max(60).optional(),
  myoglobinMgPerG: z.number().min(0.5).max(10).optional(), // mg/g wet muscle
});

type FormValues = z.infer<typeof formSchema>;

export default function MyoglobinOxygenStorageCalculator() {
  const [result, setResult] = useState<{ muscleMassKg: number; o2StoreMl: number; interpretation: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { bodyMassKg: undefined, bodyFatPercent: undefined, myoglobinMgPerG: 1.5 } });

  const calculate = (v: FormValues) => {
    if (v.bodyMassKg == null || v.bodyFatPercent == null || v.myoglobinMgPerG == null) return null;
    const fatKg = v.bodyMassKg * (v.bodyFatPercent / 100);
    const muscleKg = Math.max(0, v.bodyMassKg - fatKg) * 0.5; // approx 50% of FFM as muscle
    // mg myoglobin per g muscle => g per kg: mg/g * 1000 g/kg / 1000 mg/g = g/kg == value
    const gMyoglobinPerKg = v.myoglobinMgPerG; // since mg/g -> g/kg
    const totalG = gMyoglobinPerKg * muscleKg;
    // 1 mol O2 per mol myoglobin; approx 1.34 ml O2 per g Hb; for myoglobin similar order.
    const o2Ml = totalG * 1.2 * 1000 / 1000; // rough 1.2 ml O2 per g myoglobin
    return { muscleKg, o2Ml };
  };

  const interpret = (o2ml: number) => {
    if (o2ml >= 500) return 'High intramuscular O₂ reserve supportive of sustained efforts and hypoxia tolerance.';
    if (o2ml >= 200) return 'Moderate O₂ reserve; aerobic training may increase myoglobin content.';
    return 'Lower O₂ storage; prioritize endurance volume and iron status to support adaptations.';
  };

  const onSubmit = (v: FormValues) => {
    const r = calculate(v);
    if (!r) { setResult(null); return; }
    setResult({ muscleMassKg: Math.round(r.muscleKg * 10) / 10, o2StoreMl: Math.round(r.o2Ml), interpretation: interpret(r.o2Ml) });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="bodyMassKg" render={({ field }) => (
              <FormItem>
                <FormLabel>Body Mass (kg)</FormLabel>
                <FormControl><Input type="number" step="0.1" placeholder="e.g., 70" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="bodyFatPercent" render={({ field }) => (
              <FormItem>
                <FormLabel>Body Fat (%)</FormLabel>
                <FormControl><Input type="number" step="0.1" placeholder="e.g., 15" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="myoglobinMgPerG" render={({ field }) => (
              <FormItem>
                <FormLabel>Myoglobin (mg/g muscle)</FormLabel>
                <FormControl><Input type="number" step="0.1" placeholder="e.g., 1.5" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit"><Zap className="h-4 w-4 mr-2" />Estimate O₂ Storage</Button>
        </form>
      </Form>

      {result && (
        <Card>
          <CardHeader><CardTitle>Intramuscular Oxygen Storage</CardTitle><CardDescription>Estimated reserve from myoglobin</CardDescription></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-primary/5 rounded-lg"><p className="text-sm text-muted-foreground mb-1">Muscle Mass</p><p className="text-3xl font-bold text-primary">{result.muscleMassKg} kg</p></div>
              <div className="text-center p-6 bg-muted/50 rounded-lg"><p className="text-sm text-muted-foreground mb-1">O₂ Storage</p><p className="text-2xl font-bold">{result.o2StoreMl} ml</p></div>
              <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg"><p className="text-sm text-muted-foreground mb-1">Summary</p><p className="text-sm">{result.interpretation}</p></div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Related Calculators</CardTitle><CardDescription>Link physiology to performance</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/vo2-max-calculator" className="text-primary hover:underline">VO₂ Max</Link></h4><p className="text-sm text-muted-foreground">Cardiorespiratory ceiling.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/oxygen-cost-per-watt-efficiency-calculator" className="text-primary hover:underline">O₂ Cost per Watt</Link></h4><p className="text-sm text-muted-foreground">Movement efficiency proxy.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/red-blood-cell-count-effect-on-vo2-max-calculator" className="text-primary hover:underline">RBC → VO₂ Max</Link></h4><p className="text-sm text-muted-foreground">O₂ transport capacity.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/capillary-density-estimator" className="text-primary hover:underline">Capillary Density</Link></h4><p className="text-sm text-muted-foreground">Diffusion & delivery.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide to Myoglobin & O₂ Storage</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>This is a sample line for the complete guide section. You can add your detailed content here.</p>
          <p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Frequently Asked Questions</CardTitle><CardDescription>SEO‑optimized answers about myoglobin</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          {[
            ['What does myoglobin do?', 'Myoglobin binds oxygen inside muscle cells, acting as a local reserve and facilitating diffusion to mitochondria.'],
            ['Can training increase myoglobin?', 'Endurance training can modestly increase myoglobin content along with mitochondrial density.'],
            ['Typical myoglobin values?', 'Skeletal muscle ranges around 1–3 mg/g; values vary by fiber type and species.'],
            ['How is O₂ storage useful?', 'Higher storage buffers transient drops in O₂, supporting sustained aerobic metabolism.'],
            ['Nutrition considerations?', 'Adequate iron and overall energy availability support myoglobin synthesis.'],
            ['Difference vs hemoglobin?', 'Hemoglobin transports O₂ in blood; myoglobin stores and shuttles O₂ within muscle.'],
            ['Impact on performance?', 'Greater myoglobin may aid repeated efforts and hypoxic tolerance but does not replace high VO₂ Max.'],
            ['Is this a medical diagnostic?', 'No—this estimator is for educational planning and should not guide medical decisions.'],
          ].map(([q,a],i)=> (<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}
        </CardContent>
      </Card>
    </div>
  );
}
