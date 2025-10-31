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
import { Zap, HeartPulse, Baby, Pill, Droplets, Info, Calendar } from 'lucide-react';

const formSchema = z.object({
  folateMcg: z.number().min(0).max(2000).optional(),
  ironMg: z.number().min(0).max(100).optional(),
  vitaminDiu: z.number().min(0).max(6000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PrenatalVitaminDosageCalculator() {
  const [result, setResult] = useState<{ status: string; interpretation: string; recommendations: string[]; warningSigns: string[]; plan: { week: number; focus: string }[] } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { folateMcg: undefined, ironMg: undefined, vitaminDiu: undefined } });

  const interpret = (v: FormValues) => {
    const msgs: string[] = [];
    if (v.folateMcg != null) {
      if (v.folateMcg < 400) msgs.push('Folate below common prenatal target (~400–800 mcg).');
      else if (v.folateMcg > 1000) msgs.push('Folate above typical upper range; consult provider.');
      else msgs.push('Folate within typical prenatal range.');
    }
    if (v.ironMg != null) {
      if (v.ironMg < 27) msgs.push('Iron below typical prenatal target (~27 mg).');
      else if (v.ironMg > 45) msgs.push('Iron above upper limit; consult provider.');
      else msgs.push('Iron within common prenatal range.');
    }
    if (v.vitaminDiu != null) {
      if (v.vitaminDiu < 600) msgs.push('Vitamin D below common target (~600–2000 IU).');
      else if (v.vitaminDiu > 4000) msgs.push('Vitamin D high; confirm with labs and provider.');
      else msgs.push('Vitamin D within commonly recommended range.');
    }
    return msgs.join(' ');
  };

  const recommendations = (v: FormValues) => [
    'Choose third‑party tested prenatal formulas; verify folate is L‑methylfolate or folic acid per provider advice',
    'Split doses with meals if nausea occurs; separate iron from calcium for absorption',
    'Request labs for ferritin and 25‑OH Vitamin D to individualize dosing',
  ];

  const warnings = (v: FormValues) => [
    'Avoid megadoses without medical supervision',
    'Report symptoms such as dizziness, constipation, or GI distress to your provider',
    'Keep supplements out of reach of children; iron overdose is dangerous',
  ];

  const plan = () => ([
    { week: 1, focus: 'Begin prenatal daily; take with food and hydrate' },
    { week: 2, focus: 'Assess tolerance; adjust timing to reduce nausea' },
    { week: 3, focus: 'Discuss labs (ferritin, Vitamin D) with provider' },
    { week: 4, focus: 'Align dose forms (capsule/gummy/liquid) with tolerance' },
    { week: 5, focus: 'Reinforce calcium spacing if using iron‑rich prenatal' },
    { week: 6, focus: 'Recheck symptoms; refine regimen' },
    { week: 7, focus: 'Confirm adequate DHA/iodine from diet/supplement' },
    { week: 8, focus: 'Plan follow‑up labs if initially low' },
  ]);

  const onSubmit = (values: FormValues) => {
    setResult({ status: 'Evaluated', interpretation: interpret(values), recommendations: recommendations(values), warningSigns: warnings(values), plan: plan() });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Baby className="h-5 w-5" /> Prenatal Vitamin Analysis</CardTitle>
          <CardDescription>Screen typical folate, iron, and Vitamin D ranges</CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="folateMcg" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Pill className="h-4 w-4" /> Folate (mcg)</FormLabel>
                <FormControl>
                  <Input type="number" step="10" placeholder="e.g., 600" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="ironMg" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><HeartPulse className="h-4 w-4" /> Iron (mg)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 27" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="vitaminDiu" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Droplets className="h-4 w-4" /> Vitamin D (IU)</FormLabel>
                <FormControl>
                  <Input type="number" step="50" placeholder="e.g., 1000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit" className="w-full md:w-auto">Evaluate Dosage</Button>
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
                <CardTitle>Prenatal Dosage Evaluation</CardTitle>
              </div>
              <CardDescription>Common guideline ranges</CardDescription>
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
          <CardDescription>Pregnancy & nutrition tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/pregnancy-weight-gain-calculator" className="text-primary hover:underline">Pregnancy Weight Gain</Link></h4><p className="text-sm text-muted-foreground">Track recommended weight gain.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/iron-intake-calculator" className="text-primary hover:underline">Iron Intake</Link></h4><p className="text-sm text-muted-foreground">Daily iron requirements.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/calcium-intake-calculator" className="text-primary hover:underline">Calcium Intake</Link></h4><p className="text-sm text-muted-foreground">Bone health needs.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/vitamin-d-sun-exposure-calculator" className="text-primary hover:underline">Vitamin D Sun Exposure</Link></h4><p className="text-sm text-muted-foreground">Support Vitamin D status.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Prenatal Vitamins</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>This is a sample line for the complete guide section. You can add your detailed content here.</p>
          <p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Detailed, SEO‑oriented answers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            ['How much folate is typically recommended?', 'Many guidelines suggest ~400–800 mcg dietary folate equivalents daily before and during early pregnancy; always follow clinician advice.'],
            ['Do I need extra iron?', 'Pregnancy increases iron needs to support blood volume and fetal growth. Many prenatals provide ~27 mg; confirm with labs.'],
            ['What about Vitamin D?', 'Target intakes vary widely; a common range is 600–2000 IU/day, individualized based on 25‑OH Vitamin D lab results.'],
            ['Can I take calcium with iron?', 'Calcium can reduce iron absorption; take them at different times if advised.'],
            ['Are gummies OK?', 'They can help with tolerance but may lack iron; verify your formula covers key nutrients.'],
            ['Is nausea normal?', 'Prenatals can cause GI upset. Taking with food, splitting doses, or switching formulations may help; consult your provider.'],
            ['Is more always better?', 'No. Avoid megadoses without medical guidance; some nutrients have upper limits.'],
            ['Do I still need DHA and iodine?', 'Yes, many providers recommend adequate DHA and iodine; check your diet and supplement only as advised.'],
          ].map(([q,a],i)=> (<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}
        </CardContent>
      </Card>
    </div>
  );
}


