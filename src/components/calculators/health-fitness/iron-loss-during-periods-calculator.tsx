'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { Zap, Droplets, Calendar, HeartPulse, AlertTriangle, Scale } from 'lucide-react';

const formSchema = z.object({
  flowLevel: z.enum(['light','moderate','heavy','very_heavy']).optional(),
  periodDuration: z.number().min(2).max(10).optional(),
  frequency: z.enum(['regular','irregular']).optional(),
  ironLevel: z.number().min(10).max(200).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function IronLossDuringPeriodsCalculator() {
  const [result, setResult] = useState<{ status: string; interpretation: string; recommendations: string[]; warningSigns: string[]; plan: { week: number; focus: string }[] } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { flowLevel: undefined, periodDuration: undefined, frequency: undefined, ironLevel: undefined } });

  const interpret = (v: FormValues) => {
    const msgs: string[] = [];
    if (v.flowLevel === 'heavy' || v.flowLevel === 'very_heavy') {
      msgs.push('Heavy menstrual flow can lead to significant iron loss and increase risk of iron deficiency.');
    } else if (v.flowLevel === 'moderate') {
      msgs.push('Moderate flow may contribute to iron loss, especially if periods are prolonged or frequent.');
    } else {
      msgs.push('Light flow typically results in minimal iron loss.');
    }
    if (v.periodDuration != null && v.periodDuration > 7) {
      msgs.push('Prolonged periods increase iron loss risk; consider discussing with healthcare provider.');
    }
    if (v.ironLevel != null && v.ironLevel < 50) {
      msgs.push('Low iron levels detected; iron supplementation and dietary changes may be needed.');
    }
    return msgs.join(' ') || 'Enter your information to estimate iron loss during periods.';
  };

  const recommendations = (v: FormValues) => [
    'Consume iron-rich foods including lean meats, legumes, leafy greens, and fortified cereals',
    'Consider iron supplementation if recommended by a healthcare provider, especially for heavy periods',
    'Pair iron-rich foods with vitamin C sources to enhance iron absorption',
  ];

  const warnings = (v: FormValues) => [
    'Heavy or prolonged periods can lead to iron deficiency anemia, which requires medical evaluation',
    'Symptoms of iron deficiency include fatigue, weakness, pale skin, and shortness of breath',
    'Never self-diagnose or self-treat iron deficiency; consult a healthcare provider for proper evaluation',
  ];

  const plan = () => ([
    { week: 1, focus: 'Begin tracking menstrual flow and duration to assess iron loss risk' },
    { week: 2, focus: 'Evaluate current iron intake through diet and identify improvements' },
    { week: 3, focus: 'Consider iron-rich foods and vitamin C sources to support absorption' },
    { week: 4, focus: 'Monitor for symptoms of iron deficiency (fatigue, weakness, pale skin)' },
    { week: 5, focus: 'Discuss iron levels and supplementation needs with healthcare provider' },
    { week: 6, focus: 'Continue monitoring and adjust dietary intake as needed' },
    { week: 7, focus: 'Reassess iron status and symptoms after dietary changes' },
    { week: 8, focus: 'Establish long-term strategy for maintaining adequate iron levels' },
  ]);

  const onSubmit = (values: FormValues) => {
    setResult({ status: 'Estimated', interpretation: interpret(values), recommendations: recommendations(values), warningSigns: warnings(values), plan: plan() });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Droplets className="h-5 w-5" /> Iron Loss During Periods</CardTitle>
          <CardDescription>Estimate iron loss during menstruation and assess deficiency risk</CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="flowLevel" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Droplets className="h-4 w-4" /> Flow Level</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select flow level" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="heavy">Heavy</SelectItem>
                      <SelectItem value="very_heavy">Very Heavy</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="periodDuration" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Period Duration (days)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="frequency" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><HeartPulse className="h-4 w-4" /> Frequency</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="irregular">Irregular</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="ironLevel" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Scale className="h-4 w-4" /> Iron Level (mcg/dL)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit" className="w-full md:w-auto">Estimate Iron Loss</Button>
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
                <CardTitle>Iron Loss Evaluation</CardTitle>
              </div>
              <CardDescription>Estimated iron loss and deficiency risk assessment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">{result.interpretation}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded"><p className="text-sm text-muted-foreground mb-1">Status</p><p className="text-xl font-semibold">{result.status}</p></div>
                <div className="p-4 border rounded"><p className="text-sm text-muted-foreground mb-1">Note</p><p className="text-sm">Always follow clinician guidance</p></div>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Recommendations</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">{result.recommendations.map((r,i)=>(<li key={i} className="text-sm text-muted-foreground">{r}</li>))}</ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Warning Signs</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">{result.warningSigns.map((w,i)=>(<li key={i} className="text-sm text-muted-foreground">{w}</li>))}</ul>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Plan</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left p-2">Week</th><th className="text-left p-2">Focus</th></tr></thead><tbody>{result.plan.map(p=> (<tr key={p.week} className="border-b"><td className="p-2">{p.week}</td><td className="p-2">{p.focus}</td></tr>))}</tbody></table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Women's health tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/menstrual-cycle-phase-tracker-calculator" className="text-primary hover:underline">Menstrual Cycle Tracker</Link></h4><p className="text-sm text-muted-foreground">Track cycle phases.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/pms-symptom-score-calculator" className="text-primary hover:underline">PMS Symptom Score</Link></h4><p className="text-sm text-muted-foreground">Assess PMS symptom severity.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/iron-intake-calculator" className="text-primary hover:underline">Iron Intake</Link></h4><p className="text-sm text-muted-foreground">Calculate daily iron requirements.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary hover:underline">Daily Calorie Needs</Link></h4><p className="text-sm text-muted-foreground">Calculate daily calorie requirements.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Iron Loss During Periods</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Menstrual bleeding results in iron loss, as blood contains iron. The amount of iron lost depends on flow volume, period duration, and frequency. Heavy or prolonged periods can lead to significant iron loss, increasing the risk of iron deficiency anemia, especially if dietary iron intake is insufficient.</p>
          <p>Women with heavy periods can lose significant amounts of iron each month. The average menstrual period results in the loss of about 15-20 mg of iron, but this can be much higher with heavy flow. Since the body typically absorbs only 1-2 mg of iron daily from food, heavy periods can quickly deplete iron stores, leading to iron deficiency if not adequately replaced through diet or supplementation.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Detailed, SEO‑oriented answers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            ['How much iron do women lose during periods?', 'Iron loss during menstruation varies significantly based on flow volume. On average, women lose about 15-20 mg of iron per menstrual period, but this can range from 5-30 mg or more. Heavy periods can result in much higher iron loss. Since the body typically absorbs only 1-2 mg of iron daily from food, heavy periods can quickly deplete iron stores, especially if dietary iron intake is insufficient. Women with heavy or prolonged periods are at increased risk of iron deficiency.'],
            ['What are the symptoms of iron deficiency from menstrual blood loss?', 'Symptoms of iron deficiency include: fatigue and weakness, pale skin, shortness of breath, dizziness or lightheadedness, cold hands and feet, brittle nails, hair loss, headaches, difficulty concentrating, and cravings for non-food items (pica). Symptoms may develop gradually and can be mistaken for other conditions. If you experience these symptoms, especially if you have heavy periods, consult a healthcare provider for evaluation and testing.'],
            ['How can I prevent iron deficiency from heavy periods?', 'Prevent iron deficiency by: consuming iron-rich foods (lean meats, poultry, fish, legumes, leafy greens, fortified cereals), pairing iron-rich foods with vitamin C sources (enhances absorption), considering iron supplementation if recommended by a healthcare provider, managing heavy periods (discuss treatment options with healthcare provider), and monitoring iron levels through regular blood tests. A balanced approach combining diet and, if needed, supplementation is most effective.'],
            ['What foods are high in iron?', 'Iron-rich foods include: heme iron sources (more easily absorbed) - lean meats, poultry, fish, seafood, and non-heme iron sources (plant-based) - legumes, leafy greens, fortified cereals, nuts, seeds, and dried fruits. Heme iron from animal sources is more readily absorbed than non-heme iron from plant sources. Pairing non-heme iron sources with vitamin C (citrus fruits, tomatoes, bell peppers) can enhance absorption.'],
            ['Should I take iron supplements if I have heavy periods?', 'Iron supplementation may be recommended if: you have heavy or prolonged periods, your iron levels are low (confirmed by blood tests), you experience symptoms of iron deficiency, dietary intake is insufficient to replace losses, or your healthcare provider recommends supplementation. However, iron supplementation should be done under medical guidance, as excessive iron can be harmful. Never self-diagnose or self-treat iron deficiency without proper evaluation.'],
            ['How is iron deficiency diagnosed?', 'Iron deficiency is diagnosed through: blood tests including complete blood count (CBC), ferritin levels (iron storage), serum iron, and transferrin saturation. Normal ranges vary, but generally: ferritin below 15-30 ng/mL suggests iron deficiency, hemoglobin below 12 g/dL (women) may indicate anemia, and low serum iron with high transferrin may indicate deficiency. Your healthcare provider will interpret test results in the context of your symptoms and medical history.'],
            ['Can heavy periods cause anemia?', 'Yes, heavy periods can cause iron deficiency anemia if iron losses exceed iron intake and the body\'s ability to replace stored iron. Anemia occurs when iron deficiency is severe enough to reduce hemoglobin levels, impairing the blood\'s ability to carry oxygen. Symptoms include fatigue, weakness, pale skin, shortness of breath, and dizziness. Heavy periods are a common cause of iron deficiency anemia in women of reproductive age. Treatment involves addressing both the heavy periods and the iron deficiency.'],
            ['How long does it take to recover from iron deficiency?', 'Recovery time from iron deficiency varies based on: severity of deficiency, cause of deficiency (e.g., heavy periods), treatment approach (diet, supplementation, addressing underlying cause), individual factors (absorption, overall health). With appropriate treatment, improvement in symptoms may occur within weeks, but rebuilding iron stores can take several months. Regular monitoring and adherence to treatment are important for full recovery.'],
            ['What should I do if I have heavy periods and low iron?', 'If you have heavy periods and low iron: consult a healthcare provider for evaluation and testing, discuss treatment options for heavy periods (may include hormonal contraceptives, medications, or other interventions), increase iron-rich foods in your diet, consider iron supplementation if recommended by your provider, monitor iron levels through regular blood tests, and address any underlying causes of heavy periods. A comprehensive approach addressing both the heavy periods and iron deficiency is most effective.'],
            ['Are there ways to reduce menstrual blood loss?', 'Ways to reduce menstrual blood loss include: hormonal contraceptives (birth control pills, IUDs can reduce flow), nonsteroidal anti-inflammatory drugs (NSAIDs like ibuprofen can reduce bleeding), tranexamic acid (medication that can reduce heavy bleeding), treating underlying conditions (fibroids, polyps, hormonal imbalances), and in some cases, surgical interventions. Discuss options with a healthcare provider to determine the best approach for your situation. Reducing blood loss can help prevent iron deficiency and improve quality of life.'],
          ].map(([q,a],i)=> (<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}
        </CardContent>
      </Card>
    </div>
  );
}
