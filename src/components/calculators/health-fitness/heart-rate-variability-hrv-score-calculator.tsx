'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, HeartPulse, Calendar, Timer, Shield } from 'lucide-react';

const formSchema = z.object({
  age: z.number().min(18).max(100).optional(),
  rmssd: z.number().min(5).max(200).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  hrvScore: number;
  rmssd: number;
  category: string;
};

const steps = [
  'Enter your age and RMSSD value using similar conditions each time (for example, seated and relaxed).',
  'Submit the form to see a heart rhythm wellness score on a 0–100 scale.',
  'Review the interpretation text to get a gentle sense of how your current rhythm patterns may feel.',
  'Look through the recommendations and 8‑week plan for small, supportive habit ideas.',
  'Use the tool occasionally as a soft check‑in rather than something to track perfectly every day.',
];

const baseUrl =
  'https://mycalculating.com/category/health-fitness/heart-rate-variability-hrv-score-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Health & Fitness',
          item: 'https://mycalculating.com/category/health-fitness',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Heart Rhythm Wellness Score',
          item: baseUrl,
        },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Heart Rhythm Wellness Score',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description:
        'Get a gentle heart rhythm wellness score from RMSSD and age to reflect how your current habits may support recovery.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Establish baseline HRV by measuring RMSSD consistently (same time, same conditions)' },
  { week: 2, focus: 'Prioritize 7–9 hours of quality sleep per night to support autonomic recovery' },
  { week: 3, focus: 'Add stress management: 10–15 minutes daily meditation or breathing exercises' },
  { week: 4, focus: 'Maintain consistent sleep schedule and reduce evening screen time' },
  { week: 5, focus: 'Include regular aerobic exercise (3–4 sessions/week) to improve HRV' },
  { week: 6, focus: 'Limit alcohol and caffeine, especially in the evening' },
  { week: 7, focus: 'Reassess HRV score and compare to baseline' },
  { week: 8, focus: 'Continue healthy habits and track HRV trends over time' },
];

const faqs: [string, string][] = [
      ['What is heart rhythm variability?', 'Heart rhythm variability simply describes how the time between beats naturally changes from moment to moment. Many people use it as a gentle wellness signal for how rested or stressed their body feels.'],
      ['What is RMSSD?', 'RMSSD (Root Mean Square of Successive Differences) is one way devices summarize heartbeat changes over time. You can think of it as a raw “variation” number your watch or strap can show you.'],
      ['How is this wellness score calculated?', 'The score compares your RMSSD to a simple age‑based reference and scales it to 0–100 so it is easier to read as a personal wellness index.'],
      ['Is there a “good” score?', 'Rather than chasing a perfect number, it’s more helpful to notice your own trends over time—what makes your score drift up or down when you change sleep, stress, or movement.'],
      ['How do I measure RMSSD?', 'Most people use a chest strap heart monitor, smartwatch, or wellness app. Try to measure in similar conditions (for example, seated and relaxed at roughly the same time of day).'],
      ['Why does the score vary day to day?', 'Changes in stress, sleep, movement, hydration, and even heavy meals can shift the score. Looking at weekly patterns is usually more helpful than focusing on a single day.'],
      ['Can lifestyle habits influence this score?', 'Many people see a more stable score when they sleep consistently, manage stress gently (breathing, walks, hobbies), move their body regularly, and limit very late caffeine or screen time.'],
      ['Does age matter here?', 'This tool lightly adjusts the score based on age so that it acts as a relative wellness guide rather than a performance test.'],
      ['When is a good time to check?', 'Checking in calm conditions—often in the morning or during a quiet break—helps you compare like with like over time.'],
      ['Is this a medical test?', 'No. It is a personal wellness insight based on heartbeat variation, not a medical test or diagnosis.'],
];

const understandingInputs = [
  { label: 'Age (years)', description: 'Your age in years (18–100). HRV typically decreases with age, so age adjustment is important for accurate scoring.' },
  { label: 'RMSSD (ms)', description: 'Root Mean Square of Successive Differences, a time-domain HRV metric measured in milliseconds. Typically ranges from 10–100+ ms.' },
];

const interpret = (score: number) => {
  if (score >= 80) return 'Your heart rhythm variability looks very strong for this snapshot. Keep leaning on the routines that help you feel rested and grounded.';
  if (score >= 50) return 'Your wellness score suggests a generally supportive balance between demand and recovery. Small tweaks to sleep and stress habits can still make it even smoother.';
  if (score >= 30) return 'Your wellness score is in a middle range. This can be a gentle nudge to protect sleep, add small movement breaks, and create simple wind‑down time.';
  return 'Your current wellness score is on the lower side for this moment. It may be a sign to ease up a little, protect rest, and add small calming habits into your day.';
};

const recommendations = (score: number) => [
  'Protect a fairly regular sleep window where you feel you can wind down, sleep, and wake at similar times most days.',
  score < 50
    ? 'Experiment with one simple relaxation habit most days (for example 5–10 minutes of calm breathing, a short walk, or quiet reading without screens).'
    : 'Keep the small relaxation habits that already seem to work for you and revisit them during busier weeks.',
  'Include light to moderate movement on most days—such as walking, stretching, or gentle exercise—paired with at least one easier day each week.',
  'Notice how late‑day caffeine, heavy meals, or intense screen time affect your wind‑down and adjust them if they seem to make rest harder.',
];

const warningSigns = () => [
  'This heart rhythm wellness score is a general lifestyle insight, not a diagnosis or medical evaluation.',
  'If you feel unwell, dizzy, short of breath, or notice unexpected changes in your health, it is important to talk with a qualified professional.',
  'Treat this tool as one reflection point among many—your own sense of energy, mood, and comfort matters most.',
];

export default function HeartRateVariabilityHrvScoreCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      rmssd: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { age, rmssd } = values;
    if (age == null || rmssd == null) {
      setResult(null);
      return;
    }

    // Age-adjusted HRV score
    const expectedRmssd = 50 - (age * 0.5);
    const hrvScore = Math.max(0, Math.min(100, (rmssd / expectedRmssd) * 50));

    let category = 'Good';
    if (hrvScore < 30) category = 'Poor';
    else if (hrvScore < 50) category = 'Fair';
    else if (hrvScore >= 80) category = 'Excellent';

    setResult({
      status: 'Calculated',
      interpretation: interpret(hrvScore),
      recommendations: recommendations(hrvScore),
      warningSigns: warningSigns(),
      plan: plan(),
      hrvScore: Math.round(hrvScore),
      rmssd: Math.round(rmssd * 10) / 10,
      category,
    });
  };

  return (
    <div className="space-y-8">
      <Script
        id="heart-rhythm-wellness-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5" />
            Heart Rhythm Wellness Score
          </CardTitle>
          <CardDescription>
            Get a gentle heart rhythm wellness score from RMSSD and age as a personal lifestyle insight, not a
            medical or diagnostic test.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your heart rhythm snapshot</CardTitle>
          <CardDescription>Use similar conditions each time for a fair comparison.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Age (years)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 30"
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rmssd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Timer className="h-4 w-4" /> RMSSD (ms)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 35.2"
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate wellness score
              </Button>
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
                <CardTitle>Interactive wellness insight</CardTitle>
              </div>
              <CardDescription>See your heart rhythm wellness score and gentle context.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Heart rhythm wellness score</h4>
                  <p className="text-2xl font-bold text-primary">{result.hrvScore}/100</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">RMSSD snapshot</h4>
                  <p className="text-2xl font-bold text-primary">{result.rmssd} ms</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Pattern label</h4>
                  <p className="text-2xl font-bold text-primary">{result.category}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{result.interpretation}</p>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Recommendations</CardTitle></CardHeader>
              <CardContent><ul className="space-y-2">{result.recommendations.map((r,i)=>(<li key={i} className="text-sm text-muted-foreground">{r}</li>))}</ul></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Warning Signs</CardTitle></CardHeader>
              <CardContent><ul className="space-y-2">{result.warningSigns.map((w,i)=>(<li key={i} className="text-sm text-muted-foreground">{w}</li>))}</ul></CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week HRV Improvement Plan</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b"><th className="text-left p-2">Week</th><th className="text-left p-2">Focus</th></tr></thead>
                  <tbody>{plan().map(p=>(<tr key={p.week} className="border-b"><td className="p-2">{p.week}</td><td className="p-2">{p.focus}</td></tr>))}</tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Understanding the Inputs</CardTitle>
          <CardDescription>Use the same conditions each time for a fair comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">{understandingInputs.map((it,i)=>(<li key={i}><span className="font-semibold text-foreground">{it.label}:</span><span className="text-sm text-muted-foreground"> {it.description}</span></li>))}</ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Formula and approach</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Age‑adjusted reference:</strong> The tool builds a simple age‑based reference RMSSD value so that the score
            acts more like a relative wellness index than a strict performance test.
          </p>
          <p>
            <strong>Score idea:</strong> Your entered RMSSD is compared with that reference and scaled to a 0–100 range, then
            lightly grouped into pattern labels such as “Good” or “Excellent” for easier interpretation.
          </p>
          <p>
            This is a simplified way to reflect how your current rhythm snapshot sits relative to an age‑adjusted baseline. It is
            only one lens on your well‑being and works best when paired with how you actually feel day to day.
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
          <CardDescription>Optional tools that look at nearby lifestyle patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/recovery-heart-rate-calculator" className="text-primary hover:underline">Recovery Heart Rhythm Check-In</Link></h4><p className="text-sm text-muted-foreground">Reflect on how quickly your pulse settles after effort.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/stress-level-self-assessment-calculator" className="text-primary hover:underline">Daily Stress Tendency Check-In</Link></h4><p className="text-sm text-muted-foreground">Gently score how overloaded or steady your day feels.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/meditation-breathing-rate-calculator" className="text-primary hover:underline">Meditation Breathing Rhythm Helper</Link></h4><p className="text-sm text-muted-foreground">Explore a comfortable breathing pace for calmer sessions.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/cortisol-stress-response-estimator" className="text-primary hover:underline">Daily Stress & Recovery Balance Score</Link></h4><p className="text-sm text-muted-foreground">Look at how your sleep, movement, and downtime stack together.</p></div>
          </div>
        </CardContent>
      </Card>

      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg"
        itemType="https://schema.org/MedicalWebPage"
      >
        {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
        <meta itemProp="name" content="The Definitive Guide to Heart Rhythm Wellness: Understanding HRV and Recovery Patterns" />
        <meta
          itemProp="description"
          content="An expert, evidence-based guide on heart rate variability (HRV), detailing RMSSD interpretation, age-adjusted scoring, autonomic nervous system balance, and comprehensive strategies to support recovery and well-being."
        />
        <meta
          itemProp="keywords"
          content="heart rhythm wellness score, HRV calculator, RMSSD heart rate variability, autonomic nervous system, recovery patterns, stress recovery, wellness tracking"
        />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/definitive-heart-rhythm-wellness-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          The Definitive Guide to Heart Rhythm Wellness: Understanding HRV, Recovery Patterns, and Autonomic Balance
        </h1>
        <p className="text-lg italic text-gray-700">
          Explore the science of heart rate variability (HRV), learn how RMSSD reflects autonomic nervous system balance, understand
          age-adjusted wellness scoring, and discover comprehensive strategies to support recovery and overall well-being.
        </p>

        {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li>
            <a href="#understanding-hrv" className="hover:underline">
              Understanding Heart Rate Variability (HRV) and Autonomic Balance
            </a>
          </li>
          <li>
            <a href="#rmssd-metric" className="hover:underline">
              RMSSD: The Time-Domain HRV Metric Explained
            </a>
          </li>
          <li>
            <a href="#age-adjustment" className="hover:underline">
              Age-Adjusted Wellness Scoring and Interpretation
            </a>
          </li>
          <li>
            <a href="#lifestyle-factors" className="hover:underline">
              Lifestyle Factors That Influence Heart Rhythm Wellness
            </a>
          </li>
          <li>
            <a href="#strategies" className="hover:underline">
              Comprehensive Strategies to Support Heart Rhythm Wellness
            </a>
          </li>
        </ul>
        <hr />

        {/* UNDERSTANDING HRV */}
        <h2 id="understanding-hrv" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Understanding Heart Rate Variability (HRV) and Autonomic Balance
        </h2>
        <p>
          Heart rate variability (HRV) refers to the natural variation in time intervals between consecutive heartbeats. Unlike a
          metronome, a healthy heart does not beat at perfectly regular intervals—instead, it shows slight variations that reflect the
          dynamic interplay between the sympathetic (fight-or-flight) and parasympathetic (rest-and-digest) branches of the autonomic
          nervous system.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">What HRV Tells Us About Recovery</h3>
        <p>
          Higher HRV generally indicates better autonomic balance, greater adaptability to stress, and improved recovery capacity.
          When your body is well-rested and not under excessive stress, your heart can vary its rhythm more freely, allowing for
          better adaptation to changing demands. Lower HRV may suggest your body is working harder to maintain balance, potentially
          indicating accumulated stress, fatigue, or insufficient recovery.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Autonomic Nervous System Connection</h3>
        <p>
          HRV serves as a window into autonomic nervous system function. The parasympathetic nervous system (via the vagus nerve)
          slows heart rate and increases variability during rest. The sympathetic nervous system increases heart rate and reduces
          variability during stress or activity. A healthy balance between these systems allows for appropriate responses to
          different situations while maintaining overall stability.
        </p>

        <hr />

        {/* RMSSD METRIC */}
        <h2 id="rmssd-metric" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          RMSSD: The Time-Domain HRV Metric Explained
        </h2>
        <p>
          <b>RMSSD (Root Mean Square of Successive Differences)</b> is a time-domain HRV metric that measures the variability between
          consecutive heartbeats. It is calculated by taking the square root of the mean of the squared differences between adjacent
          R-R intervals (the time between heartbeats). RMSSD is particularly sensitive to parasympathetic (vagal) activity and is
          widely used in wellness and fitness tracking.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">How RMSSD Is Measured</h3>
        <p>
          RMSSD is typically measured using:
        </p>
        <ul>
          <li>
            <b>Chest strap heart rate monitors:</b> Provide the most accurate measurements with high sampling rates.
          </li>
          <li>
            <b>Smartwatches and fitness trackers:</b> Use optical sensors (PPG) to estimate HRV, though accuracy may vary.
          </li>
          <li>
            <b>Mobile apps:</b> Some apps use phone cameras to measure pulse variability, though this method is less reliable.
          </li>
        </ul>
        <p>
          For consistent measurements, use the same device, measure at the same time of day (often upon waking), and maintain similar
          conditions (seated, relaxed, before eating or caffeine).
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Typical RMSSD Ranges</h3>
        <p>
          RMSSD values vary widely between individuals and decrease with age. Typical ranges include:
        </p>
        <ul>
          <li>
            <b>Young adults (20-30 years):</b> Often 40-60 ms or higher
          </li>
          <li>
            <b>Middle-aged adults (30-50 years):</b> Often 30-50 ms
          </li>
          <li>
            <b>Older adults (50+ years):</b> Often 20-40 ms
          </li>
        </ul>
        <p>
          These ranges are general guidelines. Individual baselines vary significantly, and tracking your own trends over time is
          more meaningful than comparing to population averages.
        </p>

        <hr />

        {/* AGE ADJUSTMENT */}
        <h2 id="age-adjustment" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Age-Adjusted Wellness Scoring and Interpretation
        </h2>
        <p>
          HRV naturally decreases with age due to changes in autonomic function, cardiovascular health, and overall physiological
          capacity. Age-adjusted scoring allows for fair comparison across different life stages, recognizing that a 25-year-old and a
          65-year-old will naturally have different HRV baselines.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why Age Adjustment Matters</h3>
        <p>
          Without age adjustment, older adults might consistently score lower than younger adults, even when their HRV is excellent
          for their age group. Age-adjusted scoring compares your RMSSD to what would be expected for someone your age, creating a
          relative wellness index rather than an absolute performance metric.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Interpreting Your Wellness Score</h3>
        <p>
          The wellness score (0-100) reflects how your RMSSD compares to an age-adjusted reference:
        </p>
        <ul>
          <li>
            <b>80-100:</b> Your heart rhythm variability looks very strong for your age. Your autonomic balance and recovery
            capacity appear excellent.
          </li>
          <li>
            <b>50-79:</b> Your wellness score suggests generally supportive balance between demand and recovery. Small lifestyle
            adjustments may further optimize your patterns.
          </li>
          <li>
            <b>30-49:</b> Your wellness score is in a middle range. This may be a gentle nudge to prioritize sleep, stress
            management, and recovery practices.
          </li>
          <li>
            <b>Below 30:</b> Your current wellness score is lower. Consider focusing on rest, stress reduction, and supportive
            lifestyle habits.
          </li>
        </ul>

        <hr />

        {/* LIFESTYLE FACTORS */}
        <h2 id="lifestyle-factors" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Lifestyle Factors That Influence Heart Rhythm Wellness
        </h2>
        <p>
          Many lifestyle factors can influence HRV, reflecting how your body responds to daily demands and recovery opportunities.
          Understanding these factors helps you identify areas for gentle improvement.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Sleep Quality and Duration</h3>
        <p>
          Sleep is one of the most powerful influences on HRV. Inadequate sleep, poor sleep quality, or irregular sleep schedules can
          significantly reduce HRV. Aim for 7-9 hours of quality sleep per night, maintain consistent bed and wake times, and create a
          sleep environment that supports restful sleep.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Stress and Mental Load</h3>
        <p>
          Chronic stress, anxiety, and mental overload can suppress HRV by keeping the sympathetic nervous system activated. Regular
          stress management practices—such as meditation, breathing exercises, nature exposure, or hobbies—can help restore autonomic
          balance.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Physical Activity and Recovery</h3>
        <p>
          Regular moderate exercise generally supports HRV, but excessive training without adequate recovery can lower it. Balance
          activity with rest days, prioritize sleep after intense workouts, and listen to your body's signals for recovery needs.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Nutrition and Hydration</h3>
        <p>
          Large meals, alcohol, and dehydration can temporarily lower HRV. Maintain regular meal timing, stay hydrated, limit
          late-day alcohol, and notice how different foods affect your recovery patterns.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Environmental Factors</h3>
        <p>
          Light exposure (especially blue light from screens), noise, temperature, and air quality can all influence HRV. Create an
          environment that supports recovery, especially in the hours before sleep.
        </p>

        <hr />

        {/* COMPREHENSIVE STRATEGIES */}
        <h2 id="strategies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Comprehensive Strategies to Support Heart Rhythm Wellness
        </h2>
        <p>
          Supporting heart rhythm wellness involves a holistic approach that addresses sleep, stress, movement, nutrition, and
          recovery. Small, consistent changes often yield better results than dramatic shifts.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">1. Prioritize Consistent, Quality Sleep</h3>
        <ul>
          <li>
            <b>Sleep duration:</b> Aim for 7-9 hours per night, adjusting based on your individual needs.
          </li>
          <li>
            <b>Sleep schedule:</b> Maintain consistent bed and wake times, even on weekends (within 1-2 hours).
          </li>
          <li>
            <b>Sleep environment:</b> Create a dark, quiet, cool bedroom optimized for rest.
          </li>
          <li>
            <b>Pre-sleep routine:</b> Wind down 30-60 minutes before bed with calming activities.
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">2. Manage Stress and Support Recovery</h3>
        <ul>
          <li>
            <b>Regular relaxation:</b> Practice meditation, breathing exercises, or gentle movement daily.
          </li>
          <li>
            <b>Stress reduction:</b> Identify and address sources of chronic stress where possible.
          </li>
          <li>
            <b>Recovery time:</b> Schedule regular breaks, rest days, and activities that feel restorative.
          </li>
          <li>
            <b>Social connection:</b> Maintain meaningful relationships and support networks.
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">3. Balance Physical Activity</h3>
        <ul>
          <li>
            <b>Regular movement:</b> Include moderate aerobic exercise, strength training, and flexibility work.
          </li>
          <li>
            <b>Recovery days:</b> Schedule rest days and lighter activity to allow for adaptation.
          </li>
          <li>
            <b>Listen to your body:</b> Adjust intensity based on recovery signals and HRV trends.
          </li>
          <li>
            <b>Avoid overtraining:</b> Recognize signs of excessive training and prioritize recovery.
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">4. Supportive Nutrition and Hydration</h3>
        <ul>
          <li>
            <b>Regular meals:</b> Maintain consistent meal timing and avoid large meals close to bedtime.
          </li>
          <li>
            <b>Hydration:</b> Stay well-hydrated throughout the day, especially around exercise.
          </li>
          <li>
            <b>Limit evening alcohol:</b> Alcohol can disrupt sleep quality and lower HRV.
          </li>
          <li>
            <b>Notice patterns:</b> Pay attention to how different foods and timing affect your recovery.
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">5. Optimize Measurement Conditions</h3>
        <ul>
          <li>
            <b>Consistent timing:</b> Measure at the same time each day (often upon waking).
          </li>
          <li>
            <b>Similar conditions:</b> Measure in the same position (seated, lying down) and before eating or caffeine.
          </li>
          <li>
            <b>Track trends:</b> Focus on weekly patterns rather than daily fluctuations.
          </li>
          <li>
            <b>Use the same device:</b> Different devices may give different readings, so consistency matters.
          </li>
        </ul>

        <hr />

        {/* CONCLUSION */}
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>
          Heart rhythm wellness reflects the dynamic balance of your autonomic nervous system and your body's capacity for recovery
          and adaptation. By understanding HRV, RMSSD, and age-adjusted scoring, you can gain gentle insights into how your
          lifestyle patterns may be supporting or challenging your recovery. Remember that HRV is one lens on wellness—how you feel
          in your body, your energy levels, and your overall sense of well-being are equally important. Use HRV as a supportive tool
          for reflection and gentle lifestyle adjustments, not as a source of stress or perfectionism. If you have concerns about
          your heart health, recovery patterns, or overall well-being, consider consulting a qualified healthcare professional who
          can provide personalized guidance.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Supportive, wellness‑oriented answers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">{faqs.map(([q,a],i)=>(<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}</CardContent>
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
            This tool offers a heart rhythm wellness score from RMSSD and age as a gentle, lifestyle‑oriented snapshot. It is
            intended for personal reflection, not for diagnosis or treatment decisions.
          </p>
          <p>
            Outputs include a 0–100 score, pattern label, interpretation text, supportive recommendations, an 8‑week ideas plan,
            and contextual information about the inputs and simple scoring approach.
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
