'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Zap, Target, AlertTriangle, Shield, Heart, HeartPulse, Calendar } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

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
    
    if (averageScore < 3)
      msgs.push(
        'Your ratings suggest that these pre‑period days feel relatively light overall. Small lifestyle supports may already be enough for you.'
      );
    else if (averageScore < 6)
      msgs.push(
        'Your scores point to a noticeable set of pre‑period changes. Gentle routines around rest, movement, and nutrition may help these days feel a bit easier.'
      );
    else if (averageScore < 8)
      msgs.push(
        'Your responses suggest these days may feel quite intense at times. It might be helpful to plan extra support and lighter expectations around this part of your cycle.'
      );
    else
      msgs.push(
        'Your scores reflect very strong pre‑period experiences. If you ever feel worried or overwhelmed, you may wish to speak with a qualified health professional who can look at your full picture.'
      );
    
    return msgs.join(' ');
  };

  const recommendations = (v: FormValues) => [
    'Track how you feel across a few cycles to notice patterns in energy, mood, and physical sensations.',
    'When possible, give yourself a bit more room for rest, kind self‑talk, and lighter plans on tougher days.',
    'Experiment with gentle supports like movement you enjoy, calming wind‑down time, or simple comfort routines.',
  ];

  const warnings = (v: FormValues) => [
    'If you ever feel distressed, unsafe, or overwhelmed by your symptoms or mood, consider reaching out to a trusted professional promptly.',
    'If changes you notice around your cycle worry you, a qualified health professional can help you explore them in more detail.',
  ];

const steps = [
  'Rate each PMS symptom on a scale of 0-10 (0 = none, 10 = very severe).',
  'Enter scores for mood swings, irritability, fatigue, bloating, breast tenderness, headaches, food cravings, and sleep disturbance.',
  'Submit the form to see your symptom pattern insight.',
  'Review the interpretation and recommendations.',
  'Track symptoms over multiple cycles to identify patterns.',
  'Discuss persistent or severe symptoms with a healthcare provider.',
];

const faqs = [
  {
    question: 'What is PMS and when does it occur?',
    answer: 'Premenstrual syndrome (PMS) refers to physical and emotional symptoms that occur in the days leading up to menstruation, typically during the luteal phase of the menstrual cycle (after ovulation, before period). Symptoms usually appear 1-2 weeks before menstruation and resolve when the period begins.',
  },
  {
    question: 'What are the most common PMS symptoms?',
    answer: 'Common PMS symptoms include emotional symptoms (mood swings, irritability, anxiety), physical symptoms (bloating, breast tenderness, headaches, fatigue), behavioral symptoms (food cravings, sleep disturbances), and digestive symptoms. Symptom type and severity vary significantly among individuals.',
  },
  {
    question: 'How is PMS severity assessed?',
    answer: 'PMS severity is typically assessed by evaluating symptom intensity (often on a 0-10 scale), tracking symptom frequency and duration, assessing impact on daily functioning, and monitoring symptom patterns over multiple cycles. Severe PMS that significantly impacts daily life may indicate PMDD, which requires medical evaluation.',
  },
  {
    question: 'What causes PMS symptoms?',
    answer: 'PMS is believed to be caused by hormonal fluctuations (changes in estrogen and progesterone during the luteal phase), neurotransmitter changes (serotonin levels may drop), lifestyle factors (stress, lack of exercise, poor nutrition), and individual sensitivity to hormonal changes.',
  },
  {
    question: 'Can lifestyle changes help manage PMS?',
    answer: 'Yes, lifestyle modifications can help: regular exercise, balanced nutrition (reduce salt, sugar, caffeine), stress management (meditation, yoga), adequate sleep, and avoiding alcohol and smoking. These changes may reduce symptom severity, though individual responses vary.',
  },
  {
    question: 'When should I see a doctor about PMS?',
    answer: 'Consult a healthcare provider if symptoms significantly impact daily life, are severe and don\'t respond to lifestyle changes, you experience symptoms of PMDD (severe depression, anxiety), symptoms persist throughout the cycle, or you have concerns about symptom management.',
  },
  {
    question: 'What is the difference between PMS and PMDD?',
    answer: 'PMDD (premenstrual dysphoric disorder) is a more severe form of PMS characterized by severe emotional symptoms that significantly interfere with daily functioning. PMDD affects about 3-8% of women and requires medical treatment.',
  },
  {
    question: 'Can diet affect PMS symptoms?',
    answer: 'Yes, dietary changes may help: reduce salt intake (bloating), limit sugar and refined carbohydrates (mood swings), increase complex carbohydrates (mood and energy), ensure adequate calcium and magnesium, limit caffeine and alcohol, and eat regular, balanced meals.',
  },
];

const relatedCalculators = [
  {
    name: 'Menstrual Cycle Tracker',
    slug: 'menstrual-cycle-phase-tracker-calculator',
    description: 'Track cycle phases alongside symptom patterns.',
  },
  {
    name: 'Menopause Symptom Index Calculator',
    slug: 'menopause-symptom-index-calculator',
    description: 'Assess menopause symptoms for comparison.',
  },
  {
    name: 'Daily Stress Tendency Check-In',
    slug: 'stress-level-self-assessment-calculator',
    description: 'Assess stress levels that may affect PMS symptoms.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/pms-symptom-score-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'PMS Symptom Score Wellness Tracker', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'PMS Symptom Score Wellness Tracker',
      applicationCategory: 'HealthApplication',
      operatingSystem: 'Web Browser',
      description: 'Assess premenstrual symptom patterns using 0-10 ratings for personal wellness reflection.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

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

  const calculateTotalScore = (v: FormValues) => {
    const scores: number[] = [];
    if (v.moodSwings != null) scores.push(v.moodSwings);
    if (v.irritability != null) scores.push(v.irritability);
    if (v.fatigue != null) scores.push(v.fatigue);
    if (v.bloating != null) scores.push(v.bloating);
    if (v.breastTenderness != null) scores.push(v.breastTenderness);
    if (v.headaches != null) scores.push(v.headaches);
    if (v.foodCravings != null) scores.push(v.foodCravings);
    if (v.sleepDisturbance != null) scores.push(v.sleepDisturbance);
    return scores.reduce((a, b) => a + b, 0);
  };

  const calculateAverageScore = (v: FormValues) => {
    const scores: number[] = [];
    if (v.moodSwings != null) scores.push(v.moodSwings);
    if (v.irritability != null) scores.push(v.irritability);
    if (v.fatigue != null) scores.push(v.fatigue);
    if (v.bloating != null) scores.push(v.bloating);
    if (v.breastTenderness != null) scores.push(v.breastTenderness);
    if (v.headaches != null) scores.push(v.headaches);
    if (v.foodCravings != null) scores.push(v.foodCravings);
    if (v.sleepDisturbance != null) scores.push(v.sleepDisturbance);
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  };

  return (
    <div className="space-y-8">
      <Script id="pms-symptom-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            PMS Symptom Score Wellness Tracker
          </CardTitle>
          <CardDescription>
            Check in on how pre‑period days feel for you using simple 0–10 ratings. This creates a personal wellness snapshot,
            not a diagnosis.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your PMS symptom ratings</CardTitle>
          <CardDescription>Rate each symptom on a scale of 0-10 to create a personal wellness snapshot.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="moodSwings" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Heart className="h-4 w-4" /> Mood changes (0–10)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" min="0" max="10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="irritability" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Irritability or tension (0–10)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" min="0" max="10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="fatigue" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Activity className="h-4 w-4" /> Tiredness or low energy (0–10)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" min="0" max="10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="bloating" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><HeartPulse className="h-4 w-4" /> Bloating or body heaviness (0–10)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" min="0" max="10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="breastTenderness" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Chest or breast sensitivity (0–10)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" min="0" max="10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="headaches" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Head or body aches (0–10)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" min="0" max="10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="foodCravings" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><HeartPulse className="h-4 w-4" /> Shifts in appetite or cravings (0–10)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" min="0" max="10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="sleepDisturbance" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Sleep changes (0–10)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" min="0" max="10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            </div>
            <Button type="submit" className="w-full md:w-auto">
              Calculate symptom score
            </Button>
          </form>
        </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Interactive results
            </CardTitle>
            <CardDescription>See symptom pattern insight, interpretation, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded border p-4 bg-muted/50">
              <p className="text-sm text-muted-foreground mb-2">Interpretation</p>
              <p className="text-sm">{result.interpretation}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                    {result.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Important reminders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                    {result.warningSigns.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Action plan</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {result.plan.map((step) => (
                    <li key={step.week}>
                      <span className="font-semibold">Week {step.week}:</span> {step.focus}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Formula
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Total Symptom Score</strong> = Sum of all individual symptom ratings (0-10 each). This provides a total
            score across all symptoms entered.
          </p>
          <p>
            <strong>Average Symptom Score</strong> = Total Symptom Score ÷ Number of Symptoms Rated. This calculates the average
            intensity across all rated symptoms.
          </p>
          <p>
            <strong>Severity Classification:</strong> Average &lt;3 = mild, 3-6 = moderate, 6-8 = significant, &gt;8 = severe.
            These classifications are for personal reflection and do not constitute a medical diagnosis.
          </p>
          <p>
            The calculator interprets scores to provide gentle, wellness-oriented insights. Higher scores suggest more intense
            pre-period experiences that may benefit from additional support or professional guidance.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related calculators</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relatedCalculators.map((calc) => (
            <div key={calc.slug} className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href={`/category/health-fitness/${calc.slug}`} className="text-primary hover:underline">
                  {calc.name}
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">{calc.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Guide</CardTitle>
          <CardDescription>
            Comprehensive guide to PMS symptoms, menstrual cycle patterns, and strategies for managing premenstrual changes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            The Definitive Guide to PMS Symptoms: Understanding Premenstrual Changes and Management Strategies
          </h2>
          <p className="text-lg italic text-gray-700">
            Explore the science of PMS, learn about premenstrual symptoms and patterns, understand hormonal influences, and
            discover comprehensive strategies to manage premenstrual changes and support well-being throughout the menstrual cycle.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
          <ul className="list-disc ml-6 space-y-2 text-blue-600">
            <li>
              <a href="#understanding-pms" className="hover:underline">
                Understanding PMS and Premenstrual Changes
              </a>
            </li>
            <li>
              <a href="#common-symptoms" className="hover:underline">
                Common PMS Symptoms and Patterns
              </a>
            </li>
            <li>
              <a href="#hormonal-influences" className="hover:underline">
                Hormonal Influences and Cycle Phases
              </a>
            </li>
            <li>
              <a href="#management-strategies" className="hover:underline">
                Comprehensive Strategies for Managing PMS
              </a>
            </li>
          </ul>
          <hr />

          <h2 id="understanding-pms" className="text-2xl font-bold text-foreground pt-8">
            Understanding PMS and Premenstrual Changes
          </h2>
          <p>
            Premenstrual syndrome (PMS) refers to a collection of physical, emotional, and behavioral symptoms that occur in the
            days leading up to menstruation. These symptoms typically appear during the luteal phase (after ovulation, before
            period) and resolve when menstruation begins.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-6">What is PMS</h3>
          <p>
            PMS affects up to 75% of women of reproductive age, with symptoms ranging from mild to severe. The exact cause isn't
            fully understood, but hormonal fluctuations, particularly changes in estrogen and progesterone levels during the luteal
            phase, are thought to play a key role.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-6">Timing of Symptoms</h3>
          <ul>
            <li>
              <b>Onset:</b> Symptoms typically appear 1-2 weeks before menstruation
            </li>
            <li>
              <b>Peak:</b> Often most intense in the 2-3 days before period starts
            </li>
            <li>
              <b>Resolution:</b> Symptoms usually resolve within a few days of period onset
            </li>
            <li>
              <b>Pattern:</b> Symptoms follow a predictable pattern each cycle for many women
            </li>
          </ul>

          <hr />

          <h2 id="common-symptoms" className="text-2xl font-bold text-foreground pt-8">
            Common PMS Symptoms and Patterns
          </h2>
          <p>
            PMS symptoms can be categorized into emotional, physical, behavioral, and digestive symptoms. Individual experiences
            vary widely.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-6">Emotional Symptoms</h3>
          <ul>
            <li>Mood swings and irritability</li>
            <li>Anxiety and tension</li>
            <li>Depression or sadness</li>
            <li>Crying spells</li>
            <li>Difficulty concentrating</li>
            <li>Social withdrawal</li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">Physical Symptoms</h3>
          <ul>
            <li>Bloating and water retention</li>
            <li>Breast tenderness or swelling</li>
            <li>Headaches or migraines</li>
            <li>Fatigue and low energy</li>
            <li>Joint or muscle pain</li>
            <li>Weight gain</li>
            <li>Acne or skin changes</li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">Behavioral Symptoms</h3>
          <ul>
            <li>Food cravings (especially sweets or salty foods)</li>
            <li>Sleep disturbances (insomnia or excessive sleep)</li>
            <li>Changes in appetite</li>
            <li>Decreased interest in usual activities</li>
          </ul>

          <hr />

          <h2 id="hormonal-influences" className="text-2xl font-bold text-foreground pt-8">
            Hormonal Influences and Cycle Phases
          </h2>
          <p>
            PMS symptoms are closely linked to hormonal changes throughout the menstrual cycle, particularly during the luteal phase.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-6">Menstrual Cycle Phases</h3>
          <ul>
            <li>
              <b>Follicular phase:</b> Days 1-14, estrogen rises, typically symptom-free
            </li>
            <li>
              <b>Ovulation:</b> Around day 14, estrogen peaks, then drops
            </li>
            <li>
              <b>Luteal phase:</b> Days 15-28, progesterone rises then falls, PMS symptoms appear
            </li>
            <li>
              <b>Menstruation:</b> Days 1-5, hormones drop, symptoms resolve
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">Hormonal Factors</h3>
          <p>
            Research suggests PMS may be related to:
          </p>
          <ul>
            <li>
              <b>Progesterone sensitivity:</b> Some women are more sensitive to progesterone fluctuations
            </li>
            <li>
              <b>Serotonin levels:</b> Serotonin may drop before menstruation, affecting mood
            </li>
            <li>
              <b>Estrogen withdrawal:</b> Rapid drop in estrogen after ovulation may trigger symptoms
            </li>
            <li>
              <b>Individual sensitivity:</b> Genetic and lifestyle factors influence symptom severity
            </li>
          </ul>

          <hr />

          <h2 id="management-strategies" className="text-2xl font-bold text-foreground pt-8">
            Comprehensive Strategies for Managing PMS
          </h2>
          <p>
            Managing PMS involves lifestyle modifications, symptom tracking, and in some cases, medical intervention. A
            multi-faceted approach often works best.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-6">1. Lifestyle Modifications</h3>
          <ul>
            <li>
              <b>Regular exercise:</b> 30 minutes most days can reduce symptoms and improve mood
            </li>
            <li>
              <b>Balanced nutrition:</b> Reduce salt (bloating), limit sugar and caffeine (mood swings), increase complex
              carbohydrates (mood and energy)
            </li>
            <li>
              <b>Stress management:</b> Meditation, yoga, deep breathing, or relaxation techniques
            </li>
            <li>
              <b>Adequate sleep:</b> Maintain consistent sleep schedule, aim for 7-9 hours nightly
            </li>
            <li>
              <b>Avoid alcohol and smoking:</b> Can worsen symptoms
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">2. Symptom Tracking</h3>
          <ul>
            <li>
              <b>Keep a symptom diary:</b> Record symptoms daily throughout your cycle
            </li>
            <li>
              <b>Track patterns:</b> Identify when symptoms appear and resolve
            </li>
            <li>
              <b>Note triggers:</b> Identify factors that worsen or improve symptoms
            </li>
            <li>
              <b>Monitor effectiveness:</b> Track how lifestyle changes affect symptoms
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">3. Dietary Considerations</h3>
          <ul>
            <li>
              <b>Calcium:</b> 1000-1200 mg daily may reduce PMS symptoms
            </li>
            <li>
              <b>Magnesium:</b> 200-400 mg daily may help with mood and bloating
            </li>
            <li>
              <b>Vitamin B6:</b> 50-100 mg daily may reduce symptoms (consult provider)
            </li>
            <li>
              <b>Omega-3 fatty acids:</b> May help with mood and inflammation
            </li>
            <li>
              <b>Small, frequent meals:</b> Can help stabilize blood sugar and mood
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">4. When to Seek Professional Help</h3>
          <ul>
            <li>
              <b>Severe symptoms:</b> Symptoms that significantly impact daily life or relationships
            </li>
            <li>
              <b>PMDD symptoms:</b> Severe depression, anxiety, or mood changes
            </li>
            <li>
              <b>No improvement:</b> Lifestyle changes don't help after 2-3 cycles
            </li>
            <li>
              <b>Persistent symptoms:</b> Symptoms that don't resolve with menstruation
            </li>
            <li>
              <b>Safety concerns:</b> Thoughts of self-harm or severe distress
            </li>
          </ul>

          <hr />

          <h2 className="text-2xl font-bold text-foreground pt-8">Conclusion</h2>
          <p>
            Understanding PMS symptoms and patterns helps you recognize and manage premenstrual changes effectively. By tracking
            symptoms, implementing lifestyle modifications, and seeking professional guidance when needed, you can improve your
            experience throughout the menstrual cycle. Remember that PMS affects each person differently—what works for one may
            not work for another. Be patient with yourself, track your patterns, and adjust strategies based on what helps you
            feel better. If symptoms significantly impact your daily life or don't respond to lifestyle changes, consider
            consulting a healthcare provider who can provide personalized guidance and treatment options. This tool is designed
            for wellness reflection and is not a substitute for professional medical evaluation or treatment.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>FAQs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.question}>
              <h4 className="font-semibold">{faq.question}</h4>
              <p className="text-sm text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            This tool offers a PMS symptom score from individual symptom ratings (0-10) as a gentle, wellness-oriented snapshot.
            It is intended for personal reflection, not for diagnosis or treatment decisions.
          </p>
          <p>
            Outputs include total and average symptom scores, wellness status, interpretation text, supportive recommendations,
            important reminders, an action plan, and contextual information about the inputs and calculation approach.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Disclaimer
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a
            medical or psychological diagnosis, evaluation, or treatment plan. For any health concerns, please consult a qualified
            professional who can review your full situation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
