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
import { Zap, Calendar, HeartPulse, Clock, Activity, Moon } from 'lucide-react';

const formSchema = z.object({
  cycleLength: z.number().min(21).max(35).optional(),
  lastPeriodStart: z.string().optional(),
  currentDay: z.number().min(1).max(35).optional(),
  averageCycle: z.number().min(21).max(35).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function MenstrualCyclePhaseTrackerCalculator() {
  const [result, setResult] = useState<{ status: string; interpretation: string; recommendations: string[]; warningSigns: string[]; plan: { week: number; focus: string }[] } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { cycleLength: undefined, lastPeriodStart: undefined, currentDay: undefined, averageCycle: undefined } });

  const interpret = (v: FormValues) => {
    const msgs: string[] = [];
    if (v.currentDay != null && v.cycleLength != null) {
      if (v.currentDay <= 5) msgs.push('Menstrual phase: Shedding of uterine lining.');
      else if (v.currentDay <= 13) msgs.push('Follicular phase: Follicle development and estrogen rise.');
      else if (v.currentDay <= 16) msgs.push('Ovulation phase: Egg release, peak fertility window.');
      else if (v.currentDay <= 28) msgs.push('Luteal phase: Progesterone rise, preparation for potential pregnancy.');
      else msgs.push('End of cycle: Approaching next menstrual phase.');
    }
    if (v.cycleLength != null) {
      if (v.cycleLength < 21 || v.cycleLength > 35) msgs.push('Cycle length outside typical range (21-35 days); consider discussing with healthcare provider.');
    }
    return msgs.join(' ') || 'Enter your cycle information to track phases.';
  };

  const recommendations = (v: FormValues) => [
    'Track cycle phases to better understand your body\'s hormonal patterns and fertility windows',
    'Monitor symptoms throughout your cycle to identify patterns and potential concerns',
    'Use cycle tracking to plan activities, manage symptoms, and optimize health decisions',
  ];

  const warnings = (v: FormValues) => [
    'Irregular cycles or significant changes in cycle length may indicate underlying health issues',
    'Severe pain, heavy bleeding, or other concerning symptoms warrant medical evaluation',
    'Cycle tracking is a tool for awareness but should not replace professional medical advice',
  ];

  const plan = () => ([
    { week: 1, focus: 'Begin tracking cycle start date and symptoms' },
    { week: 2, focus: 'Monitor follicular phase symptoms and energy levels' },
    { week: 3, focus: 'Track ovulation signs and fertility indicators' },
    { week: 4, focus: 'Observe luteal phase symptoms and mood changes' },
    { week: 5, focus: 'Review cycle patterns and identify any irregularities' },
    { week: 6, focus: 'Continue tracking to establish baseline patterns' },
    { week: 7, focus: 'Monitor for changes in cycle length or symptoms' },
    { week: 8, focus: 'Use cycle data to inform health and lifestyle decisions' },
  ]);

  const onSubmit = (values: FormValues) => {
    setResult({ status: 'Tracked', interpretation: interpret(values), recommendations: recommendations(values), warningSigns: warnings(values), plan: plan() });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Moon className="h-5 w-5" /> Menstrual Cycle Phase Tracker</CardTitle>
          <CardDescription>Track and understand your menstrual cycle phases</CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="cycleLength" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Cycle Length (days)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="lastPeriodStart" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Clock className="h-4 w-4" /> Last Period Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="currentDay" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Activity className="h-4 w-4" /> Current Cycle Day</FormLabel>
                <FormControl>
                  <Input type="number" step="1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="averageCycle" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><HeartPulse className="h-4 w-4" /> Average Cycle Length</FormLabel>
                <FormControl>
                  <Input type="number" step="1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit" className="w-full md:w-auto">Track Cycle Phase</Button>
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
                <CardTitle>Cycle Phase Evaluation</CardTitle>
              </div>
              <CardDescription>Current menstrual cycle phase and tracking information</CardDescription>
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
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/iron-loss-during-periods-calculator" className="text-primary hover:underline">Iron Loss During Periods</Link></h4><p className="text-sm text-muted-foreground">Estimate menstrual iron loss.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/conception-probability-per-cycle-calculator" className="text-primary hover:underline">Conception Probability</Link></h4><p className="text-sm text-muted-foreground">Estimate conception probability.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/fertility-ovulation-calculator" className="text-primary hover:underline">Fertility Ovulation Calculator</Link></h4><p className="text-sm text-muted-foreground">Track ovulation cycles.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Menstrual Cycle Phase Tracking</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>The menstrual cycle consists of four main phases: menstrual, follicular, ovulation, and luteal. Understanding these phases helps women track their health, fertility, and symptoms. Each phase is characterized by specific hormonal changes that affect energy, mood, and physical symptoms.</p>
          <p>The menstrual phase (days 1-5) involves shedding of the uterine lining. The follicular phase (days 1-13) includes follicle development and rising estrogen. Ovulation (around day 14) is when an egg is released. The luteal phase (days 15-28) involves rising progesterone and preparation for potential pregnancy or menstruation.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Detailed, SEO‑oriented answers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            ['What are the four phases of the menstrual cycle?', 'The menstrual cycle has four phases: 1) Menstrual phase (days 1-5): Shedding of the uterine lining, marked by bleeding. 2) Follicular phase (days 1-13): Follicle development in the ovaries, rising estrogen levels, and rebuilding of the uterine lining. 3) Ovulation (around day 14): Release of a mature egg from the ovary, peak fertility window. 4) Luteal phase (days 15-28): Formation of the corpus luteum, rising progesterone, preparation for potential pregnancy. If pregnancy doesn\'t occur, the cycle returns to the menstrual phase.'],
            ['How long is a typical menstrual cycle?', 'A typical menstrual cycle ranges from 21 to 35 days, with an average of 28 days. Cycle length is counted from the first day of menstruation to the day before the next period begins. Variations in cycle length are normal, especially in adolescents and perimenopausal women. Cycles shorter than 21 days or longer than 35 days may warrant medical evaluation, especially if this is a new pattern or accompanied by other symptoms.'],
            ['When does ovulation occur in the cycle?', 'Ovulation typically occurs around day 14 of a 28-day cycle, but timing varies based on cycle length. In general, ovulation happens about 14 days before the next expected period. For example, in a 30-day cycle, ovulation may occur around day 16. Signs of ovulation include increased cervical mucus (clear, stretchy), slight rise in basal body temperature, mild abdominal pain (mittelschmerz), and positive ovulation predictor kit results.'],
            ['What symptoms are normal during each phase?', 'Menstrual phase: Cramping, bloating, fatigue, mood changes. Follicular phase: Increasing energy, improved mood, clearer skin. Ovulation: Peak energy, increased libido, clear cervical mucus, possible mild abdominal discomfort. Luteal phase: Possible bloating, breast tenderness, mood changes, fatigue (especially in the latter half). While some symptoms are normal, severe pain, excessive bleeding, or significant mood disturbances warrant medical evaluation.'],
            ['How can I track my menstrual cycle phases?', 'Cycle tracking methods include: calendar tracking (marking period start dates), basal body temperature (BBT) charting (temperature rises after ovulation), cervical mucus observation (changes throughout the cycle), ovulation predictor kits (detect hormone surges), and cycle tracking apps (combine multiple methods). Consistent tracking over several cycles helps identify patterns and predict phase timing.'],
            ['Why is cycle phase tracking important?', 'Cycle phase tracking helps: understand fertility windows for conception or contraception, identify patterns in symptoms and energy levels, detect irregularities that may indicate health issues, optimize timing for activities, workouts, or health decisions, manage PMS and other cycle-related symptoms, and provide valuable information for healthcare providers. Tracking empowers women to better understand their bodies and health.'],
            ['What causes irregular menstrual cycles?', 'Irregular cycles can be caused by: hormonal imbalances (PCOS, thyroid disorders), stress and lifestyle factors, significant weight changes, excessive exercise, medical conditions (endometriosis, fibroids), medications, perimenopause, and other health issues. Occasional irregularities are normal, but persistent or significant changes warrant medical evaluation to identify and address underlying causes.'],
            ['How do hormones change throughout the cycle?', 'Hormonal changes include: Estrogen rises during the follicular phase, peaks just before ovulation, then drops and rises again in the luteal phase. Progesterone is low during the follicular phase, rises after ovulation, peaks in the mid-luteal phase, then drops if pregnancy doesn\'t occur. Follicle-stimulating hormone (FSH) and luteinizing hormone (LH) peak around ovulation. These hormonal fluctuations drive the physical and emotional changes experienced throughout the cycle.'],
            ['Can cycle phase affect energy and performance?', 'Yes, cycle phases can affect energy and performance. Many women experience: Higher energy during the follicular phase and ovulation, potential performance improvements during these phases, lower energy and increased fatigue during the luteal phase, and variations in strength, endurance, and recovery throughout the cycle. Understanding these patterns can help optimize training, nutrition, and activity planning. Some athletes adjust training intensity based on cycle phases.'],
            ['When should I see a doctor about my menstrual cycle?', 'Consult a healthcare provider if you experience: cycles consistently shorter than 21 days or longer than 35 days, severe pain or heavy bleeding, bleeding between periods, missed periods (if not pregnant), significant changes in cycle length or symptoms, symptoms suggesting hormonal imbalances, or concerns about fertility. Regular menstrual cycles are an important indicator of overall health, and addressing concerns early can help identify and treat underlying issues.'],
          ].map(([q,a],i)=> (<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}
        </CardContent>
      </Card>
    </div>
  );
}
