'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Zap, Target, AlertTriangle, Shield, Thermometer, HeartPulse, Calendar } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

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

const steps = [
  'Rate each menopause symptom on a scale of 0-10 (0 = none, 10 = very severe).',
  'Enter scores for hot flashes, night sweats, mood changes, sleep disturbance, vaginal dryness, fatigue, brain fog, and joint pain.',
  'Submit the form to see your symptom index evaluation.',
  'Review the interpretation and recommendations.',
  'Track symptoms over time to identify patterns and assess treatment effectiveness.',
  'Discuss persistent or severe symptoms with a healthcare provider.',
];

const faqs = [
  {
    question: 'What is menopause and when does it occur?',
    answer: 'Menopause is the natural end of a woman\'s reproductive years, marked by the cessation of menstruation for 12 consecutive months. It typically occurs between ages 45-55, with an average age of 51. Perimenopause is the transition period before menopause, which can last several years.',
  },
  {
    question: 'What are the most common menopause symptoms?',
    answer: 'Common symptoms include vasomotor symptoms (hot flashes, night sweats), emotional symptoms (mood changes, irritability), sleep disturbances, genitourinary symptoms (vaginal dryness), physical symptoms (fatigue, joint pain), cognitive symptoms (brain fog), and sexual symptoms (decreased libido).',
  },
  {
    question: 'How long do menopause symptoms last?',
    answer: 'Hot flashes and night sweats typically last 1-5 years but can persist longer. The perimenopausal transition can last 4-8 years, and some symptoms may continue post-menopause. Individual experiences vary significantly.',
  },
  {
    question: 'What causes menopause symptoms?',
    answer: 'Menopause symptoms are primarily caused by declining estrogen and progesterone levels as the ovaries gradually stop producing these hormones. Hormonal fluctuations during perimenopause can cause various symptoms.',
  },
  {
    question: 'Can lifestyle changes help manage menopause symptoms?',
    answer: 'Yes, lifestyle modifications can help: regular exercise, cooling strategies, stress management, balanced nutrition (calcium and vitamin D for bone health), adequate sleep, and avoiding triggers (spicy foods, hot beverages, stress for hot flashes).',
  },
  {
    question: 'What medical treatments are available for menopause symptoms?',
    answer: 'Medical treatments include hormone therapy (HT/HRT), non-hormonal medications (antidepressants, gabapentin), vaginal estrogen, and other treatments based on specific symptoms. Treatment decisions should be made with a healthcare provider.',
  },
  {
    question: 'Is hormone therapy safe for menopause?',
    answer: 'Hormone therapy can be safe and effective for many women when used appropriately. It\'s generally considered safest for women under 60, within 10 years of menopause, and at low risk for cardiovascular disease. Discuss risks and benefits with a healthcare provider.',
  },
  {
    question: 'How does menopause affect bone health?',
    answer: 'Menopause significantly affects bone health due to declining estrogen levels. Women can lose 1-2% of bone mass per year during the first few years after menopause, increasing the risk of osteoporosis. Strategies include adequate calcium and vitamin D, weight-bearing exercise, and possibly medications.',
  },
];

const relatedCalculators = [
  {
    name: 'PMS Symptom Score Calculator',
    slug: 'pms-symptom-score-calculator',
    description: 'Assess PMS symptom severity for comparison.',
  },
  {
    name: 'Bone Strength Lifestyle Insight Tool',
    slug: 'bone-density-t-score-calculator',
    description: 'Assess bone health during menopause transition.',
  },
  {
    name: 'Sleep Balance Check-In',
    slug: 'sleep-debt-calculator-hf',
    description: 'Track sleep patterns affected by menopause symptoms.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/menopause-symptom-index-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Menopause Symptom Index Wellness Tracker', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Menopause Symptom Index Wellness Tracker',
      applicationCategory: 'HealthApplication',
      operatingSystem: 'Web Browser',
      description: 'Assess menopause symptom severity using 0-10 ratings for personal wellness reflection.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

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
      <Script id="menopause-symptom-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Menopause Symptom Index Wellness Tracker
          </CardTitle>
          <CardDescription>Assess menopause symptom severity to inform management strategies</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your menopause symptom ratings</CardTitle>
          <CardDescription>Rate each symptom on a scale of 0-10 to create a personal wellness snapshot.</CardDescription>
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
            <Button type="submit" className="w-full md:w-auto">
              Calculate symptom index
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
            <CardDescription>See symptom index evaluation, interpretation, and recommendations.</CardDescription>
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
            <strong>Severity Classification:</strong> Average &lt;3 = mild, 3-6 = moderate, 6-8 = severe, &gt;8 = very severe.
            These classifications are for personal reflection and do not constitute a medical diagnosis.
          </p>
          <p>
            The calculator interprets scores to provide gentle, wellness-oriented insights. Higher scores suggest more intense
            menopause experiences that may benefit from additional support or professional guidance.
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
            Comprehensive guide to menopause, symptom management, hormonal changes, and strategies for navigating the menopausal
            transition
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            The Definitive Guide to Menopause: Understanding Symptoms, Hormonal Changes, and Management Strategies
          </h2>
          <p className="text-lg italic text-gray-700">
            Explore the science of menopause, learn about menopausal symptoms and transitions, understand hormonal influences, and
            discover comprehensive strategies to manage symptoms and support well-being during this natural life transition.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
          <ul className="list-disc ml-6 space-y-2 text-blue-600">
            <li>
              <a href="#understanding-menopause" className="hover:underline">
                Understanding Menopause and the Menopausal Transition
              </a>
            </li>
            <li>
              <a href="#common-symptoms" className="hover:underline">
                Common Menopause Symptoms and Patterns
              </a>
            </li>
            <li>
              <a href="#hormonal-changes" className="hover:underline">
                Hormonal Changes and Their Effects
              </a>
            </li>
            <li>
              <a href="#management-strategies" className="hover:underline">
                Comprehensive Strategies for Managing Menopause Symptoms
              </a>
            </li>
          </ul>
          <hr />

          <h2 id="understanding-menopause" className="text-2xl font-bold text-foreground pt-8">
            Understanding Menopause and the Menopausal Transition
          </h2>
          <p>
            Menopause is a natural biological process marking the end of a woman's reproductive years. It's defined as the
            cessation of menstruation for 12 consecutive months, typically occurring between ages 45-55.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-6">Stages of Menopause</h3>
          <ul>
            <li>
              <b>Perimenopause:</b> The transition period before menopause, can last 4-8 years, characterized by irregular periods
              and various symptoms
            </li>
            <li>
              <b>Menopause:</b> Marked by 12 consecutive months without menstruation
            </li>
            <li>
              <b>Postmenopause:</b> The years after menopause, symptoms may continue but typically decrease over time
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">What Causes Menopause</h3>
          <p>
            Menopause occurs when the ovaries gradually stop producing estrogen and progesterone, leading to the end of menstrual
            cycles. This is a natural aging process, though it can be induced by surgery, chemotherapy, or other medical
            treatments.
          </p>

          <hr />

          <h2 id="common-symptoms" className="text-2xl font-bold text-foreground pt-8">
            Common Menopause Symptoms and Patterns
          </h2>
          <p>
            Menopause symptoms vary widely among women in type, severity, and duration. Understanding common symptoms helps in
            recognition and management.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-6">Vasomotor Symptoms</h3>
          <ul>
            <li>
              <b>Hot flashes:</b> Sudden feelings of heat, often with sweating and flushing
            </li>
            <li>
              <b>Night sweats:</b> Hot flashes that occur during sleep
            </li>
            <li>
              <b>Duration:</b> Typically last 1-5 years but can persist longer
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">Emotional and Cognitive Symptoms</h3>
          <ul>
            <li>Mood changes, irritability, anxiety, depression</li>
            <li>Brain fog, memory issues, difficulty concentrating</li>
            <li>Sleep disturbances (insomnia, frequent waking)</li>
            <li>Fatigue and low energy</li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">Physical Symptoms</h3>
          <ul>
            <li>Vaginal dryness and discomfort</li>
            <li>Urinary issues (frequency, urgency, incontinence)</li>
            <li>Joint pain and stiffness</li>
            <li>Headaches</li>
            <li>Weight gain (especially around abdomen)</li>
            <li>Hair thinning or loss</li>
            <li>Skin changes (dryness, thinning)</li>
          </ul>

          <hr />

          <h2 id="hormonal-changes" className="text-2xl font-bold text-foreground pt-8">
            Hormonal Changes and Their Effects
          </h2>
          <p>
            Menopause is characterized by significant hormonal changes that affect multiple body systems.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-6">Estrogen Decline</h3>
          <p>
            Declining estrogen levels affect:
          </p>
          <ul>
            <li>
              <b>Bone health:</b> Increased bone loss, higher osteoporosis risk
            </li>
            <li>
              <b>Cardiovascular health:</b> Changes in cholesterol levels, increased heart disease risk
            </li>
            <li>
              <b>Genitourinary system:</b> Vaginal dryness, urinary symptoms
            </li>
            <li>
              <b>Temperature regulation:</b> Hot flashes and night sweats
            </li>
            <li>
              <b>Mood and cognition:</b> Mood changes, brain fog
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">Progesterone Decline</h3>
          <p>
            Declining progesterone contributes to sleep disturbances and may affect mood regulation.
          </p>

          <hr />

          <h2 id="management-strategies" className="text-2xl font-bold text-foreground pt-8">
            Comprehensive Strategies for Managing Menopause Symptoms
          </h2>
          <p>
            Managing menopause symptoms involves lifestyle modifications, symptom tracking, and in some cases, medical
            intervention. A personalized approach works best.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-6">1. Lifestyle Modifications</h3>
          <ul>
            <li>
              <b>Regular exercise:</b> Can reduce hot flashes, improve mood, support bone health, and help with weight management
            </li>
            <li>
              <b>Cooling strategies:</b> Dress in layers, use fans, keep environment cool, avoid triggers (spicy foods, hot
              beverages, stress)
            </li>
            <li>
              <b>Stress management:</b> Meditation, yoga, deep breathing, relaxation techniques
            </li>
            <li>
              <b>Balanced nutrition:</b> Adequate calcium (1200 mg) and vitamin D (600-800 IU) for bone health, limit alcohol and
              caffeine
            </li>
            <li>
              <b>Sleep hygiene:</b> Maintain cool sleeping environment, consistent sleep schedule, relaxation before bed
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">2. Symptom Tracking</h3>
          <ul>
            <li>
              <b>Keep a symptom diary:</b> Record symptoms, severity, triggers, and patterns
            </li>
            <li>
              <b>Monitor changes:</b> Track how symptoms evolve over time
            </li>
            <li>
              <b>Assess treatment effectiveness:</b> Note how lifestyle changes or treatments affect symptoms
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">3. Medical Treatments</h3>
          <ul>
            <li>
              <b>Hormone therapy (HT/HRT):</b> Can effectively treat hot flashes, night sweats, vaginal dryness, and protect
              bone health
            </li>
            <li>
              <b>Non-hormonal medications:</b> Antidepressants, gabapentin for hot flashes
            </li>
            <li>
              <b>Vaginal estrogen:</b> For vaginal dryness and urinary symptoms
            </li>
            <li>
              <b>Bone health medications:</b> If needed for osteoporosis prevention or treatment
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">4. When to Seek Professional Help</h3>
          <ul>
            <li>
              <b>Severe symptoms:</b> Symptoms that significantly impact daily life or quality of life
            </li>
            <li>
              <b>Considering treatment:</b> If considering hormone therapy or other medical treatments
            </li>
            <li>
              <b>Bone health concerns:</b> Discuss bone density testing and prevention strategies
            </li>
            <li>
              <b>Unusual symptoms:</b> Symptoms that seem unrelated to menopause or are concerning
            </li>
          </ul>

          <hr />

          <h2 className="text-2xl font-bold text-foreground pt-8">Conclusion</h2>
          <p>
            Understanding menopause symptoms and management strategies helps you navigate this natural life transition more
            effectively. By tracking symptoms, implementing lifestyle modifications, and seeking professional guidance when needed,
            you can manage symptoms and maintain well-being during and after menopause. Remember that menopause affects each person
            differently—what works for one may not work for another. Be patient with yourself, track your patterns, and work with
            healthcare providers to develop a personalized management plan. If symptoms significantly impact your daily life or
            don't respond to lifestyle changes, consider consulting a healthcare provider who specializes in menopause management.
            This tool is designed for wellness reflection and is not a substitute for professional medical evaluation or treatment.
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
            This tool offers a menopause symptom index from individual symptom ratings (0-10) as a gentle, wellness-oriented
            snapshot. It is intended for personal reflection, not for diagnosis or treatment decisions.
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
