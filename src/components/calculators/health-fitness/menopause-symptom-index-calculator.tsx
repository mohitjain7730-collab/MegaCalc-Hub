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
import { Zap, AlertTriangle, Calendar, Activity, HeartPulse, Thermometer } from 'lucide-react';

const formSchema = z.object({
  hotFlashes: z.number().min(0).max(10).optional(),
  nightSweats: z.number().min(0).max(10).optional(),
  moodChanges: z.number().min(0).max(10).optional(),
  sleepDisturbance: z.number().min(0).max(10).optional(),
  vaginalDryness: z.number().min(0).max(10).optional(),
  fatigue: z.number().min(0).max(10).optional(),
  brainFog: z.number().min(0).max(10).optional(),
  jointPain: z.number().min(0).max(10).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function MenopauseSymptomIndexCalculator() {
  const [result, setResult] = useState<{ status: string; interpretation: string; recommendations: string[]; warningSigns: string[]; plan: { week: number; focus: string }[] } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { hotFlashes: undefined, nightSweats: undefined, moodChanges: undefined, sleepDisturbance: undefined, vaginalDryness: undefined, fatigue: undefined, brainFog: undefined, jointPain: undefined } });

  const interpret = (v: FormValues) => {
    const scores: number[] = [];
    if (v.hotFlashes != null) scores.push(v.hotFlashes);
    if (v.nightSweats != null) scores.push(v.nightSweats);
    if (v.moodChanges != null) scores.push(v.moodChanges);
    if (v.sleepDisturbance != null) scores.push(v.sleepDisturbance);
    if (v.vaginalDryness != null) scores.push(v.vaginalDryness);
    if (v.fatigue != null) scores.push(v.fatigue);
    if (v.brainFog != null) scores.push(v.brainFog);
    if (v.jointPain != null) scores.push(v.jointPain);
    
    if (scores.length === 0) return 'Enter symptom scores to assess menopause symptom severity.';
    
    const totalScore = scores.reduce((a, b) => a + b, 0);
    const averageScore = totalScore / scores.length;
    const msgs: string[] = [];
    
    if (averageScore < 3) msgs.push('Mild menopause symptoms; typically manageable with lifestyle modifications.');
    else if (averageScore < 6) msgs.push('Moderate menopause symptoms; may benefit from lifestyle changes and possibly medical intervention.');
    else if (averageScore < 8) msgs.push('Severe menopause symptoms; consider consulting a healthcare provider for management strategies.');
    else msgs.push('Very severe menopause symptoms; medical evaluation and treatment strongly recommended.');
    
    return msgs.join(' ');
  };

  const recommendations = (v: FormValues) => [
    'Track symptoms to identify patterns and assess treatment effectiveness',
    'Consider lifestyle modifications including regular exercise, stress management, and cooling strategies for hot flashes',
    'Discuss treatment options with a healthcare provider, including hormone therapy if appropriate',
  ];

  const warnings = (v: FormValues) => [
    'Severe or persistent symptoms that significantly impact daily life warrant medical evaluation',
    'Sudden onset of severe symptoms or symptoms that seem unrelated to menopause should be evaluated',
    'Menopause symptoms can vary significantly; what works for one person may not work for another',
  ];

  const plan = () => ([
    { week: 1, focus: 'Begin tracking menopause symptoms and their impact on daily life' },
    { week: 2, focus: 'Identify symptom patterns and potential triggers' },
    { week: 3, focus: 'Implement lifestyle modifications (exercise, cooling strategies, stress management)' },
    { week: 4, focus: 'Continue tracking and assess effectiveness of interventions' },
    { week: 5, focus: 'Discuss symptoms and treatment options with healthcare provider' },
    { week: 6, focus: 'Evaluate treatment effectiveness and adjust as needed' },
    { week: 7, focus: 'Continue monitoring symptoms and treatment response' },
    { week: 8, focus: 'Establish long-term management plan based on symptom patterns and treatment response' },
  ]);

  const onSubmit = (values: FormValues) => {
    setResult({ status: 'Indexed', interpretation: interpret(values), recommendations: recommendations(values), warningSigns: warnings(values), plan: plan() });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Thermometer className="h-5 w-5" /> Menopause Symptom Index</CardTitle>
          <CardDescription>Assess menopause symptom severity to inform management strategies</CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, (errors) => console.error('Form validation errors:', errors))} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="hotFlashes" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Thermometer className="h-4 w-4" /> Hot Flashes (0-10)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" min="0" max="10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="nightSweats" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Night Sweats (0-10)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" min="0" max="10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="moodChanges" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><HeartPulse className="h-4 w-4" /> Mood Changes (0-10)</FormLabel>
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
            <FormField control={form.control} name="vaginalDryness" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Vaginal Dryness (0-10)</FormLabel>
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
            <FormField control={form.control} name="brainFog" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Brain Fog (0-10)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" min="0" max="10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="jointPain" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><HeartPulse className="h-4 w-4" /> Joint Pain (0-10)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" min="0" max="10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit" className="w-full md:w-auto">Calculate Symptom Index</Button>
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
                <CardTitle>Menopause Symptom Index Evaluation</CardTitle>
              </div>
              <CardDescription>Assessment of menopause symptom severity</CardDescription>
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
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/pms-symptom-score-calculator" className="text-primary hover:underline">PMS Symptom Score</Link></h4><p className="text-sm text-muted-foreground">Assess PMS symptom severity.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/menstrual-cycle-phase-tracker-calculator" className="text-primary hover:underline">Menstrual Cycle Tracker</Link></h4><p className="text-sm text-muted-foreground">Track cycle phases.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/bone-density-t-score-calculator" className="text-primary hover:underline">Bone Density T-Score</Link></h4><p className="text-sm text-muted-foreground">Assess bone health.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/iron-loss-during-periods-calculator" className="text-primary hover:underline">Iron Loss During Periods</Link></h4><p className="text-sm text-muted-foreground">Estimate menstrual iron loss.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Menopause Symptom Index</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Menopause is a natural biological process marking the end of a woman's reproductive years, typically occurring around age 45-55. The transition involves hormonal changes that can cause various symptoms affecting physical and emotional well-being. Understanding symptom severity helps inform management strategies and identify when medical intervention may be beneficial.</p>
          <p>Common menopause symptoms include hot flashes, night sweats, mood changes, sleep disturbances, vaginal dryness, fatigue, brain fog, and joint pain. Symptom severity varies significantly among women, with some experiencing mild symptoms and others experiencing severe symptoms that significantly impact daily life. Effective management often involves a combination of lifestyle modifications and medical treatments.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Detailed, SEO‑oriented answers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            ['What is menopause and when does it occur?', 'Menopause is the natural end of a woman\'s reproductive years, marked by the cessation of menstruation for 12 consecutive months. It typically occurs between ages 45-55, with an average age of 51 in the United States. Perimenopause is the transition period before menopause, which can last several years and is characterized by irregular periods and various symptoms. Menopause is a natural biological process, not a medical condition, though it can cause significant symptoms for some women.'],
            ['What are the most common menopause symptoms?', 'Common menopause symptoms include: vasomotor symptoms (hot flashes, night sweats), emotional symptoms (mood changes, irritability, anxiety, depression), sleep disturbances (insomnia, frequent waking), genitourinary symptoms (vaginal dryness, urinary issues), physical symptoms (fatigue, joint pain, headaches, weight gain), cognitive symptoms (brain fog, memory issues, difficulty concentrating), and sexual symptoms (decreased libido, discomfort). Symptom type and severity vary significantly among women, and symptoms may change over time.'],
            ['How long do menopause symptoms last?', 'Menopause symptoms can last for varying durations. Hot flashes and night sweats typically last 1-5 years but can persist longer in some women. Other symptoms may come and go or persist throughout the menopausal transition and beyond. The perimenopausal transition can last 4-8 years, and some symptoms may continue post-menopause. Individual experiences vary significantly, and some women experience symptoms for decades.'],
            ['What causes menopause symptoms?', 'Menopause symptoms are primarily caused by declining estrogen and progesterone levels as the ovaries gradually stop producing these hormones. The hormonal fluctuations during perimenopause can cause various symptoms. Other factors that may influence symptoms include: genetics, lifestyle factors (stress, diet, exercise), overall health, and individual sensitivity to hormonal changes. The exact mechanisms aren\'t fully understood, but hormonal changes are the primary driver of symptoms.'],
            ['Can lifestyle changes help manage menopause symptoms?', 'Yes, lifestyle modifications can help manage many menopause symptoms: regular exercise (can reduce hot flashes, improve mood, support bone health), cooling strategies (dress in layers, use fans, keep environment cool), stress management (meditation, yoga, relaxation techniques), balanced nutrition (calcium and vitamin D for bone health, limit alcohol and caffeine), adequate sleep (maintain sleep hygiene, create cool sleeping environment), and avoiding triggers (spicy foods, hot beverages, stress for hot flashes). These changes can significantly improve symptoms for many women.'],
            ['What medical treatments are available for menopause symptoms?', 'Medical treatments for menopause symptoms include: hormone therapy (HT/HRT) - can effectively treat hot flashes, night sweats, vaginal dryness, and bone loss, non-hormonal medications (antidepressants, gabapentin for hot flashes), vaginal estrogen (for vaginal dryness and urinary symptoms), and other treatments based on specific symptoms. Treatment decisions should be made with a healthcare provider, considering individual risks, benefits, and preferences.'],
            ['Is hormone therapy safe for menopause?', 'Hormone therapy (HT) can be safe and effective for many women when used appropriately. Benefits include relief from hot flashes, night sweats, vaginal symptoms, and protection against bone loss. Risks vary based on: type and route of hormone therapy, dose and duration, age and time since menopause, individual health factors, and personal and family medical history. HT is generally considered safest for: women under 60, within 10 years of menopause, and at low risk for cardiovascular disease and blood clots. Discuss risks and benefits with a healthcare provider.'],
            ['What are hot flashes and how can they be managed?', 'Hot flashes are sudden feelings of heat, often accompanied by sweating and flushing, that occur due to hormonal changes affecting the body\'s temperature regulation. Management strategies include: cooling strategies (dress in layers, use fans, keep environment cool), avoid triggers (spicy foods, hot beverages, alcohol, stress, hot environments), stress reduction techniques, regular exercise, and medical treatments (hormone therapy, non-hormonal medications) if needed. Hot flashes typically decrease in frequency and intensity over time.'],
            ['How does menopause affect bone health?', 'Menopause significantly affects bone health due to declining estrogen levels, which play a crucial role in bone maintenance. Estrogen deficiency leads to increased bone resorption and decreased bone formation, resulting in bone loss. Women can lose 1-2% of bone mass per year during the first few years after menopause. This increases the risk of osteoporosis and fractures. Strategies to protect bone health include: adequate calcium and vitamin D intake, weight-bearing exercise, avoiding smoking and excessive alcohol, bone density testing, and possibly medications if needed.'],
            ['When should I see a doctor about menopause symptoms?', 'Consult a healthcare provider if: symptoms significantly impact daily life or quality of life, you\'re considering hormone therapy or other treatments, you have concerns about bone health or other menopause-related health risks, you experience unusual symptoms or symptoms that seem unrelated to menopause, you have a personal or family history of conditions that may affect treatment decisions, or you need guidance on managing symptoms. Regular healthcare during menopause is important for monitoring health, managing symptoms, and preventing or treating related health issues. A healthcare provider can help develop a personalized management plan.'],
          ].map(([q,a],i)=> (<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}
        </CardContent>
      </Card>
    </div>
  );
}
