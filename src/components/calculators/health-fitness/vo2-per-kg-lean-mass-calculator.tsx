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
import { Zap, Gauge, Activity, Scale, HeartPulse, Info, Calendar, Target } from 'lucide-react';

const formSchema = z.object({
  vo2MaxMlMin: z.number().positive('Enter VO2 (ml/min)').optional(),
  bodyMassKg: z.number().positive('Enter mass (kg)').optional(),
  bodyFatPercent: z.number().min(0).max(60).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function VO2PerKgLeanMassCalculator() {
  const [result, setResult] = useState<{ 
    vo2PerKg: number; 
    vo2PerKgLean: number; 
    classification: string;
    interpretation: string; 
    recommendations: string[];
    warningSigns: string[];
    plan: { week: number; focus: string }[];
  } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { vo2MaxMlMin: undefined, bodyMassKg: undefined, bodyFatPercent: undefined } });

  const calculate = (v: FormValues) => {
    if (v.vo2MaxMlMin == null || v.bodyMassKg == null || v.bodyFatPercent == null) return null;
    const vo2PerKg = v.vo2MaxMlMin / v.bodyMassKg;
    const leanMassKg = v.bodyMassKg * (1 - v.bodyFatPercent / 100);
    const vo2PerKgLean = v.vo2MaxMlMin / leanMassKg;
    return { vo2PerKg, vo2PerKgLean };
  };

  const classify = (vkg: number) => {
    if (vkg >= 60) return 'Excellent';
    if (vkg >= 50) return 'Very Good';
    if (vkg >= 40) return 'Good';
    if (vkg >= 30) return 'Fair';
    return 'Needs Improvement';
  };

  const interpret = (vkg: number, vkgLean: number) => {
    if (vkgLean - vkg > 12) return 'Lean‑mass normalization reveals higher cardiorespiratory capacity than total‑mass normalization. Body composition strongly influences your per‑kg score.';
    if (vkg >= 60) return 'Your aerobic fitness is excellent. Maintain with polarized endurance and periodic threshold blocks.';
    if (vkg >= 40) return 'Solid aerobic fitness. Raising threshold and long‑run volume can move you to the next tier.';
    return 'Focus on building an aerobic base (Zone 2), consistency, and progressive weekly volume.';
  };

  const buildRecommendations = (vkg: number) => {
    const rec: string[] = [
      'Train 4–6 days/week with a polarized mix of easy endurance and one to two quality sessions',
      'Track resting HR and recovery; increase volume gradually (no more than 10% per week)',
      'Support training with adequate carbs and iron‑rich foods; prioritize sleep',
    ];
    if (vkg < 40) rec.unshift('Emphasize Zone 2 aerobic sessions of 45–90 minutes to expand mitochondrial base');
    else rec.unshift('Include weekly tempo/threshold work to improve lactate clearance and sustainable pace');
    return rec;
  };

  const buildWarnings = (vkg: number) => {
    return [
      'Avoid aggressive deficits that impair training quality and recovery',
      'If body‑fat estimates are uncertain, retest with a consistent method',
      'Back off if persistent fatigue or elevated resting HR appears for >3 days',
    ];
  };

  const buildPlan = () => {
    return [
      { week: 1, focus: 'Establish baseline: 3–4 aerobic sessions + 1 tempo' },
      { week: 2, focus: 'Progress volume by ~5–10%; maintain one threshold set' },
      { week: 3, focus: 'Add strides/hill sprints for economy; keep easy days easy' },
      { week: 4, focus: 'Deload 20–30% volume; prioritize sleep and mobility' },
      { week: 5, focus: 'Resume volume; introduce longer steady tempo' },
      { week: 6, focus: 'Progress tempo duration or intensity slightly' },
      { week: 7, focus: 'Mix aerobic intervals (e.g., 4×8 min @ threshold)' },
      { week: 8, focus: 'Reassess; schedule VO₂ or field test to gauge progress' },
    ];
  };

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    if (!res) { setResult(null); return; }
    const vkg = Math.round(res.vo2PerKg * 10) / 10;
    const vkgLean = Math.round(res.vo2PerKgLean * 10) / 10;
    setResult({
      vo2PerKg: vkg,
      vo2PerKgLean: vkgLean,
      classification: classify(vkg),
      interpretation: interpret(vkg, vkgLean),
      recommendations: buildRecommendations(vkg),
      warningSigns: buildWarnings(vkg),
      plan: buildPlan(),
    });
  };

  return (
    <div className="space-y-8">
      {/* Input Form (Inflation-style structure) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            VO₂ Normalization Analysis
          </CardTitle>
          <CardDescription>Compare VO₂ per kg body mass vs per kg lean mass</CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Activity className="h-5 w-5 text-primary" /> Test Inputs</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="vo2MaxMlMin" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><HeartPulse className="h-4 w-4" /> VO₂ Max (ml/min)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 3200" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="bodyMassKg" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Scale className="h-4 w-4" /> Body Mass (kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 68" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="bodyFatPercent" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Target className="h-4 w-4" /> Body Fat (%)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 20" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
              </div>
            </div>
          </div>
          <Button type="submit" className="w-full md:w-auto">Analyze VO₂ Normalizations</Button>
        </form>
      </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          {/* Main Results Card (Inflation-style) */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>VO₂ Normalized Results</CardTitle>
                  <CardDescription>Comparison and training guidance</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">VO₂ per kg (total mass)</div>
                  <p className="text-3xl font-bold text-primary">{result.vo2PerKg} ml/min/kg</p>
                </div>
                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">VO₂ per kg lean mass</div>
                  <p className="text-3xl font-bold text-green-600">{result.vo2PerKgLean} ml/min/kg</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 border rounded">
                  <p className="text-sm text-muted-foreground mb-1">Classification</p>
                  <p className="text-xl font-semibold">{result.classification}</p>
                </div>
                <div className="p-4 border rounded md:col-span-2">
                  <p className="text-sm text-muted-foreground mb-1">Interpretation</p>
                  <p className="text-sm">{result.interpretation}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations and Warnings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Training Recommendations</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, i)=> (
                    <li key={i} className="text-sm text-muted-foreground">{rec}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Warning Signs</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.warningSigns.map((w, i)=> (
                    <li key={i} className="text-sm text-muted-foreground">{w}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* 8-Week Focus Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Focus Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b"><th className="text-left p-2">Week</th><th className="text-left p-2">Focus</th></tr>
                  </thead>
                  <tbody>
                    {result.plan.map(row => (
                      <tr key={row.week} className="border-b"><td className="p-2">{row.week}</td><td className="p-2">{row.focus}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Connect VO₂, composition, and training</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/vo2-max-calculator" className="text-primary hover:underline">VO₂ Max Calculator</Link></h4><p className="text-sm text-muted-foreground">Baseline aerobic capacity.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/lean-body-mass-calculator" className="text-primary hover:underline">Lean Body Mass Calculator</Link></h4><p className="text-sm text-muted-foreground">Estimate FFM.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/training-volume-calculator" className="text-primary hover:underline">Training Volume</Link></h4><p className="text-sm text-muted-foreground">Plan weekly load.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/heart-rate-zone-training-calculator" className="text-primary hover:underline">Heart Rate Zones</Link></h4><p className="text-sm text-muted-foreground">Target intensities.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: VO₂ Normalization</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>This is a sample line for the complete guide section. You can add your detailed content here.</p>
          <p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Detailed, SEO‑oriented answers about VO₂ per kg and per kg lean mass</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            ['What is VO₂ per kg lean mass?', 'It normalizes oxygen uptake to fat‑free mass, providing a composition‑independent indicator of cardiorespiratory capacity.'],
            ['Why can VO₂ per kg and per kg lean mass differ?', 'Higher body‑fat lowers per‑kg values without changing true aerobic ability; lean‑mass normalization corrects for that.'],
            ['Is VO₂ per kg lean mass better for tracking training?', 'It can be more sensitive to cardiovascular and mitochondrial adaptations when body composition is changing.'],
            ['How do I improve these numbers?', 'Build aerobic base (Zone 2), add tempo/threshold intervals, and improve body composition gradually if appropriate.'],
            ['What inputs does the calculator use?', 'Absolute VO₂ (ml/min), body mass, and body‑fat percentage to estimate fat‑free mass and compute both normalizations.'],
            ['Are the results medical advice?', 'No. They are educational estimates and should not replace professional evaluation.'],
            ['How accurate is body‑fat input?', 'Field methods vary; DEXA and well‑performed skinfolds are more reliable than guesswork.'],
            ['Does weight loss always raise VO₂ per kg?', 'Often yes, but maintaining muscle and training quality is key to improving performance sustainably.'],
            ['What benchmarks are typical?', 'Recreational: 35–50 ml/min/kg; trained endurance: 55–70+; lean‑mass values are typically 10–25% higher.'],
          ].map(([q,a],i)=> (<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}
        </CardContent>
      </Card>
    </div>
  );
}


