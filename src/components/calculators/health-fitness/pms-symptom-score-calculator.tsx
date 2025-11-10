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
import { Zap, HeartPulse, AlertTriangle, Calendar, Activity, Heart } from 'lucide-react';

const formSchema = z.object({
  moodSwings: z.number().min(0).max(10).optional(),
  irritability: z.number().min(0).max(10).optional(),
  fatigue: z.number().min(0).max(10).optional(),
  bloating: z.number().min(0).max(10).optional(),
  breastTenderness: z.number().min(0).max(10).optional(),
  headaches: z.number().min(0).max(10).optional(),
  foodCravings: z.number().min(0).max(10).optional(),
  sleepDisturbance: z.number().min(0).max(10).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PmsSymptomScoreCalculator() {
  const [result, setResult] = useState<{ status: string; interpretation: string; recommendations: string[]; warningSigns: string[]; plan: { week: number; focus: string }[] } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { moodSwings: undefined, irritability: undefined, fatigue: undefined, bloating: undefined, breastTenderness: undefined, headaches: undefined, foodCravings: undefined, sleepDisturbance: undefined } });

  const interpret = (v: FormValues) => {
    const scores: number[] = [];
    if (v.moodSwings != null) scores.push(v.moodSwings);
    if (v.irritability != null) scores.push(v.irritability);
    if (v.fatigue != null) scores.push(v.fatigue);
    if (v.bloating != null) scores.push(v.bloating);
    if (v.breastTenderness != null) scores.push(v.breastTenderness);
    if (v.headaches != null) scores.push(v.headaches);
    if (v.foodCravings != null) scores.push(v.foodCravings);
    if (v.sleepDisturbance != null) scores.push(v.sleepDisturbance);
    
    const totalScore = scores.reduce((a, b) => a + b, 0);
    const averageScore = scores.length > 0 ? totalScore / scores.length : 0;
    const msgs: string[] = [];
    
    if (averageScore < 3) msgs.push('Mild PMS symptoms; typically manageable with lifestyle modifications.');
    else if (averageScore < 6) msgs.push('Moderate PMS symptoms; may benefit from lifestyle changes and possibly medical intervention.');
    else if (averageScore < 8) msgs.push('Severe PMS symptoms; consider consulting a healthcare provider for management strategies.');
    else msgs.push('Very severe PMS symptoms; medical evaluation and treatment recommended.');
    
    return msgs.join(' ');
  };

  const recommendations = (v: FormValues) => [
    'Track symptoms throughout your cycle to identify patterns and triggers',
    'Consider lifestyle modifications including regular exercise, stress management, and balanced nutrition',
    'Consult with a healthcare provider if symptoms significantly impact daily life or quality of life',
  ];

  const warnings = (v: FormValues) => [
    'Severe PMS symptoms that significantly impact daily functioning may indicate PMDD (premenstrual dysphoric disorder)',
    'If symptoms persist throughout the cycle or are severe, consult a healthcare provider for evaluation',
    'Sudden changes in PMS symptoms or new severe symptoms warrant medical attention',
  ];

  const plan = () => ([
    { week: 1, focus: 'Begin tracking PMS symptoms throughout your cycle' },
    { week: 2, focus: 'Identify symptom patterns and potential triggers' },
    { week: 3, focus: 'Implement lifestyle modifications (exercise, nutrition, stress management)' },
    { week: 4, focus: 'Continue tracking and assess effectiveness of interventions' },
    { week: 5, focus: 'Consider dietary changes and supplement evaluation with provider' },
    { week: 6, focus: 'Reassess symptom severity and adjust management strategies' },
    { week: 7, focus: 'Monitor for improvements or need for medical intervention' },
    { week: 8, focus: 'Establish long-term management plan based on symptom patterns' },
  ]);

  const onSubmit = (values: FormValues) => {
    setResult({ status: 'Scored', interpretation: interpret(values), recommendations: recommendations(values), warningSigns: warnings(values), plan: plan() });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5" /> PMS Symptom Score</CardTitle>
          <CardDescription>Assess PMS symptom severity to inform management strategies</CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="moodSwings" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Heart className="h-4 w-4" /> Mood Swings (0-10)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" min="0" max="10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="irritability" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Irritability (0-10)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" min="0" max="10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="fatigue" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Activity className="h-4 w-4" /> Fatigue (0-10)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" min="0" max="10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="bloating" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><HeartPulse className="h-4 w-4" /> Bloating (0-10)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" min="0" max="10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="breastTenderness" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Breast Tenderness (0-10)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" min="0" max="10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="headaches" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Headaches (0-10)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" min="0" max="10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="foodCravings" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><HeartPulse className="h-4 w-4" /> Food Cravings (0-10)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" min="0" max="10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="sleepDisturbance" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Sleep Disturbance (0-10)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" min="0" max="10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit" className="w-full md:w-auto">Calculate PMS Score</Button>
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
                <CardTitle>PMS Symptom Score Evaluation</CardTitle>
              </div>
              <CardDescription>Assessment of PMS symptom severity</CardDescription>
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
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/menopause-symptom-index-calculator" className="text-primary hover:underline">Menopause Symptom Index</Link></h4><p className="text-sm text-muted-foreground">Assess menopause symptoms.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/iron-loss-during-periods-calculator" className="text-primary hover:underline">Iron Loss During Periods</Link></h4><p className="text-sm text-muted-foreground">Estimate menstrual iron loss.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/stress-level-self-assessment-calculator" className="text-primary hover:underline">Stress Level Self-Assessment</Link></h4><p className="text-sm text-muted-foreground">Assess stress levels.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: PMS Symptom Scoring</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Premenstrual syndrome (PMS) affects many women in the days leading up to menstruation. Symptoms can range from mild to severe and may include mood changes, physical discomfort, and behavioral changes. Understanding symptom severity helps inform management strategies and identify when medical intervention may be beneficial.</p>
          <p>PMS symptoms typically occur during the luteal phase of the menstrual cycle (after ovulation) and resolve with the onset of menstruation. Common symptoms include mood swings, irritability, fatigue, bloating, breast tenderness, headaches, food cravings, and sleep disturbances. Symptom severity varies significantly among individuals and may change over time.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Detailed, SEO‑oriented answers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            ['What is PMS and when does it occur?', 'Premenstrual syndrome (PMS) refers to physical and emotional symptoms that occur in the days leading up to menstruation, typically during the luteal phase of the menstrual cycle (after ovulation, before period). Symptoms usually appear 1-2 weeks before menstruation and resolve when the period begins. PMS affects up to 75% of women, with severity ranging from mild to severe. Symptoms are thought to be related to hormonal fluctuations, particularly changes in estrogen and progesterone levels.'],
            ['What are the most common PMS symptoms?', 'Common PMS symptoms include: emotional symptoms (mood swings, irritability, anxiety, depression, crying spells), physical symptoms (bloating, breast tenderness, headaches, fatigue, joint or muscle pain, weight gain), behavioral symptoms (food cravings, sleep disturbances, difficulty concentrating, social withdrawal), and digestive symptoms (constipation, diarrhea, nausea). Symptom type and severity vary significantly among individuals. Some women experience primarily emotional symptoms, while others have more physical symptoms.'],
            ['How is PMS severity assessed?', 'PMS severity is typically assessed by: evaluating symptom intensity (often on a 0-10 scale), tracking symptom frequency and duration, assessing impact on daily functioning and quality of life, monitoring symptom patterns over multiple cycles, and using standardized questionnaires or symptom diaries. Severe PMS that significantly impacts daily life may indicate premenstrual dysphoric disorder (PMDD), which requires medical evaluation and treatment.'],
            ['What causes PMS symptoms?', 'PMS is believed to be caused by: hormonal fluctuations (changes in estrogen and progesterone during the luteal phase), neurotransmitter changes (serotonin levels may drop before menstruation), lifestyle factors (stress, lack of exercise, poor nutrition), and individual sensitivity to hormonal changes. The exact cause isn\'t fully understood, but hormonal changes are thought to trigger symptoms in women who are sensitive to these fluctuations.'],
            ['Can lifestyle changes help manage PMS?', 'Yes, lifestyle modifications can help manage PMS symptoms: regular exercise (can reduce symptoms and improve mood), balanced nutrition (reduce salt, sugar, and caffeine; increase complex carbohydrates), stress management (meditation, yoga, relaxation techniques), adequate sleep (maintain consistent sleep schedule), and avoiding alcohol and smoking. These changes may reduce symptom severity, though individual responses vary.'],
            ['When should I see a doctor about PMS?', 'Consult a healthcare provider if: symptoms significantly impact daily life or relationships, symptoms are severe and don\'t respond to lifestyle changes, you experience symptoms of PMDD (severe depression, anxiety, or mood changes), symptoms persist throughout the cycle (not just before period), or you have concerns about symptom management. Medical evaluation can help identify underlying issues and develop appropriate treatment plans.'],
            ['What is the difference between PMS and PMDD?', 'PMDD (premenstrual dysphoric disorder) is a more severe form of PMS characterized by: severe emotional symptoms (depression, anxiety, irritability, mood swings), symptoms that significantly interfere with daily functioning, symptoms that occur only during the luteal phase, and symptoms that resolve with menstruation. PMDD affects about 3-8% of women and requires medical treatment. If you suspect PMDD, consult a healthcare provider for evaluation and treatment options.'],
            ['Can diet affect PMS symptoms?', 'Yes, dietary changes may help manage PMS: reduce salt intake (can help with bloating), limit sugar and refined carbohydrates (may reduce mood swings and cravings), increase complex carbohydrates (may improve mood and energy), ensure adequate calcium and magnesium intake (may reduce symptoms), limit caffeine and alcohol (can worsen symptoms), and eat regular, balanced meals. Some women find that specific dietary changes significantly improve their symptoms.'],
            ['Are there medications that can help with PMS?', 'Medical treatments for PMS may include: over-the-counter pain relievers (for headaches, cramps, breast tenderness), hormonal contraceptives (can regulate hormonal fluctuations), antidepressants (SSRIs, particularly for emotional symptoms), diuretics (for severe bloating), and supplements (calcium, magnesium, vitamin B6, may help some women). Treatment should be discussed with a healthcare provider based on individual symptoms and needs.'],
            ['How can I track my PMS symptoms?', 'Track PMS symptoms by: keeping a symptom diary (record symptoms daily throughout your cycle), using cycle tracking apps (many include PMS symptom tracking), noting symptom severity (use a scale like 0-10), tracking symptom timing (when symptoms appear and resolve), recording lifestyle factors (stress, sleep, exercise, diet), and monitoring patterns over several cycles. Consistent tracking helps identify patterns, triggers, and effectiveness of management strategies, and provides valuable information for healthcare providers.'],
          ].map(([q,a],i)=> (<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}
        </CardContent>
      </Card>
    </div>
  );
}
