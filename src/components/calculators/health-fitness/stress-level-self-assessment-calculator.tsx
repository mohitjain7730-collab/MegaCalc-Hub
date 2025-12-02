'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Zap, Target, AlertTriangle, Shield, Brain } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';

const items = [
  'In the past few days, how often have your days felt rushed or overloaded?',
  'How supported do you feel by your current routines and habits?',
  'How easy is it for you to unwind and "switch off" at the end of the day?',
  'How often do you notice tension in your body (for example, tight shoulders or jaw)?',
  'How steady or unsettled has your mood felt over the last few days?',
];

const formSchema = z.object({ scores: z.array(z.number().min(0).max(4)).length(items.length) });
type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  score: number;
  maxScore: number;
  scorePercent: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Rate each question on a scale of 0-4 based on your recent experience.',
  'Move the sliders to reflect how your days have felt.',
  'Review your stress tendency score, interpretation, and recommendations.',
];

const faqs = [
  {
    question: 'What does this stress tendency check-in measure?',
    answer:
      'This tool provides a gentle self-reflection on how your recent days have felt in terms of stress, tension, support, and mood. It is not a clinical assessment but rather a wellness-oriented check-in to help you notice patterns and consider supportive habits.',
  },
  {
    question: 'How should I interpret my score?',
    answer:
      'Lower scores (0-6) suggest your days may feel lighter or more manageable. Higher scores (14-20) suggest your days may feel more loaded or demanding. Middle scores (7-13) indicate a mixed pattern. Use the score as a gentle guide, not a judgment.',
  },
  {
    question: 'Is a higher score bad?',
    answer:
      'No. Higher scores simply reflect that your days may feel more full or demanding. They are not "bad" but rather an opportunity to notice what might be helpful—such as breaks, movement, connection, or support. The goal is awareness, not achieving a low score.',
  },
  {
    question: 'How often should I use this check-in?',
    answer:
      'You can use this check-in daily, weekly, or whenever you want to pause and reflect. Regular check-ins can help you notice patterns over time, but avoid obsessing over daily fluctuations. Focus on overall trends rather than perfect scores.',
  },
  {
    question: 'What if my score is consistently high?',
    answer:
      'If your score is consistently high and you feel overwhelmed, consider exploring supportive strategies like stress management techniques, lifestyle adjustments, or professional support. Persistent high stress may benefit from professional guidance.',
  },
  {
    question: 'Can this tool diagnose anxiety or depression?',
    answer:
      'No. This tool is designed for wellness reflection and is not a diagnostic tool. It cannot evaluate, diagnose, or treat mental health conditions. If you have concerns about anxiety, depression, or other mental health issues, please consult a qualified mental health professional.',
  },
  {
    question: 'What lifestyle factors affect stress levels?',
    answer:
      'Many factors can influence stress, including sleep quality, work demands, relationships, physical activity, nutrition, time management, social support, and life circumstances. This tool helps you notice patterns rather than identify specific causes.',
  },
  {
    question: 'How can I reduce stress naturally?',
    answer:
      'Natural stress reduction strategies include regular physical activity, adequate sleep, healthy nutrition, mindfulness or meditation, social connection, time management, hobbies, nature exposure, and relaxation techniques. What works varies by individual.',
  },
  {
    question: 'When should I seek professional help for stress?',
    answer:
      'Consider seeking professional help if stress feels overwhelming, persistent, interferes with daily functioning, affects relationships or work, leads to physical symptoms, or causes significant distress. Mental health professionals can provide personalized support and treatment.',
  },
  {
    question: 'Can stress be beneficial?',
    answer:
      'Yes. Acute stress in response to challenges can be motivating and help you perform. However, chronic or excessive stress can negatively impact physical and mental health. The goal is managing stress effectively, not eliminating all stress.',
  },
];

const relatedCalculators = [
  {
    name: 'Workday Balance & Overload Tendency Score',
    slug: 'burnout-risk-score-calculator',
    description: 'Assess work-related stress and balance patterns.',
  },
  {
    name: 'Heart Rhythm Wellness Score',
    slug: 'heart-rate-variability-hrv-score-calculator',
    description: 'Explore how stress may affect heart rhythm patterns.',
  },
  {
    name: 'Sleep Balance Check-In',
    slug: 'sleep-debt-calculator-hf',
    description: 'Evaluate how stress may impact sleep patterns.',
  },
  {
    name: 'Meditation Breathing Rhythm Helper',
    slug: 'meditation-breathing-rate-calculator',
    description: 'Learn breathing techniques to support stress management.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/stress-level-self-assessment-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Daily Stress Tendency Check-In', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Daily Stress Tendency Check-In',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Assess daily stress tendency from self-reflection questions about workload, support, relaxation, tension, and mood.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const total = values.scores.reduce((s, x) => s + (x ?? 0), 0);
  const maxScore = items.length * 4;
  const scorePercent = (total / maxScore) * 100;

  let status: ResultPayload['status'] = 'optimal';
  let interpretation =
    'Your responses suggest a lighter stress load right now. You can keep leaning on the habits that already support you.';

  if (total >= 14) {
    status = 'low';
    interpretation =
      'Your days may be feeling quite full or demanding. Gentle supports—like short breaks, movement, or talking with someone you trust—may be helpful. This is a personal insight, not a medical evaluation.';
  } else if (total >= 10) {
    status = 'moderate';
    interpretation =
      'Your recent days show a mixed stress pattern—small, steady routines can help you feel more grounded. Consider what supports might feel helpful right now.';
  } else if (total >= 7) {
    status = 'good';
    interpretation =
      'Your responses suggest a generally manageable stress load. You may find it helpful to continue the habits that support you and notice what helps you feel balanced.';
  } else {
    status = 'optimal';
    interpretation =
      'Your responses suggest a lighter stress load right now. You can keep leaning on the habits that already support you.';
  }

  const recommendations = [
    'Take small breaks during the day to stretch, breathe, or step outside.',
    'Add a short, calming ritual in the evening, like journaling or listening to gentle music.',
    'Move your body in a way that feels good—such as walking, light exercise, or dancing.',
  ];

  if (total >= 10) {
    recommendations.push('Consider talking with someone you trust about how your days have been feeling.');
    recommendations.push('Notice what activities or routines help you feel more grounded and make time for them.');
  }

  if (total >= 14) {
    recommendations.push('If stress feels overwhelming, consider exploring professional support or stress management resources.');
  }

  const plan = [
    {
      label: 'This Week',
      detail:
        'Notice your stress patterns: observe when stress feels higher or lower, identify triggers or supportive factors, and experiment with small stress-reduction practices like breathing exercises or short breaks.',
    },
    {
      label: 'This Month',
      detail:
        'Establish stress management habits: develop regular relaxation practices, maintain social connections, prioritize sleep and physical activity, and create boundaries around work or demanding activities.',
    },
    {
      label: 'Ongoing',
      detail:
        'Continue monitoring your stress patterns and adjusting strategies as needed. Remember that stress naturally fluctuates, and focus on building resilience and supportive habits rather than eliminating all stress.',
    },
  ];

  return {
    score: total,
    maxScore,
    scorePercent,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function StressLevelSelfAssessmentCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { scores: Array(items.length).fill(undefined) } as unknown as FormValues,
  });

  return (
    <div className="space-y-8">
      <Script
        id="stress-level-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Daily Stress Tendency Check-In
          </CardTitle>
          <CardDescription>
            Use a short self-reflection to notice how your recent days feel in terms of stress and tension. This is a personal
            lifestyle insight, not a medical evaluation.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your stress reflection</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="space-y-6">
                {items.map((label, i) => (
                  <FormField
                    key={i}
                    control={form.control}
                    name={`scores.${i}` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm text-foreground">{label}</FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={4}
                            step={1}
                            defaultValue={[0]}
                            value={[field.value ?? 0]}
                            onValueChange={(v) => field.onChange(v[0])}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <Button type="submit" className="w-full md:w-auto">
                See my stress tendency insight
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
            <CardDescription>See stress tendency score, interpretation, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Score</p>
                <p className="text-2xl font-semibold text-primary">{result.score}</p>
                <p className="text-xs text-muted-foreground">Out of {result.maxScore}</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Score %</p>
                <p className="text-2xl font-semibold text-primary">{result.scorePercent.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Of maximum</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Pattern</p>
                <p className="text-2xl font-semibold text-primary">
                  {result.score <= 6 ? 'Lighter' : result.score >= 14 ? 'Heavier' : 'Mixed'}
                </p>
                <p className="text-xs text-muted-foreground">Stress load</p>
              </div>
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
                    {result.recommendations.map((rec) => (
                      <li key={rec}>{rec}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Action plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {result.plan.map((step) => (
                      <li key={step.label}>
                        <span className="font-semibold">{step.label}:</span> {step.detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
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
            <strong>Stress Tendency Score</strong> = Sum of all question ratings (0-4 each). Total possible score ranges from 0
            (lowest stress tendency) to 20 (highest stress tendency).
          </p>
          <p>
            <strong>Score Percentage</strong> = (Total Score / Maximum Score) × 100. This provides a normalized view of stress
            tendency relative to the maximum possible score.
          </p>
          <p>
            <strong>Status Categories:</strong> Scores are grouped into wellness-oriented categories (optimal, good, moderate, low)
            to provide gentle guidance rather than diagnostic labels.
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

      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg"
        itemType="https://schema.org/MedicalWebPage"
      >
        {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
        <meta itemProp="name" content="The Definitive Guide to Daily Stress Management: Understanding and Managing Stress Tendency" />
        <meta
          itemProp="description"
          content="An expert, evidence-based guide on daily stress management, detailing stress recognition, factors affecting stress levels, and comprehensive strategies to manage stress effectively and support overall well-being."
        />
        <meta
          itemProp="keywords"
          content="daily stress management, stress tendency check-in, stress reduction strategies, stress recognition, stress coping techniques, mental wellness, stress assessment"
        />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/definitive-daily-stress-management-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          The Definitive Guide to Daily Stress Management: Understanding Stress Tendency and Building Resilience
        </h1>
        <p className="text-lg italic text-gray-700">
          Explore the science of stress, learn how to recognize stress patterns, understand factors affecting daily stress levels,
          and discover comprehensive strategies to manage stress effectively and support overall mental and physical well-being.
        </p>

        {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li>
            <a href="#understanding-stress" className="hover:underline">
              Understanding Stress and Its Impact
            </a>
          </li>
          <li>
            <a href="#recognizing-stress" className="hover:underline">
              Recognizing Stress Patterns and Symptoms
            </a>
          </li>
          <li>
            <a href="#stress-factors" className="hover:underline">
              Factors Affecting Daily Stress Levels
            </a>
          </li>
          <li>
            <a href="#stress-management" className="hover:underline">
              Comprehensive Stress Management Strategies
            </a>
          </li>
          <li>
            <a href="#building-resilience" className="hover:underline">
              Building Stress Resilience and Coping Skills
            </a>
          </li>
        </ul>
        <hr />

        {/* UNDERSTANDING STRESS */}
        <h2 id="understanding-stress" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Understanding Stress and Its Impact
        </h2>
        <p>
          Stress is the body's natural response to challenges, demands, or threats. It involves physiological, psychological, and
          behavioral reactions designed to help you cope with difficult situations. While acute stress can be motivating and
          adaptive, chronic or excessive stress can negatively impact physical and mental health.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Types of Stress</h3>
        <p>
          <b>Acute stress:</b> Short-term stress in response to immediate challenges. This type of stress is normal and can be
          motivating.
        </p>
        <p>
          <b>Chronic stress:</b> Long-term, ongoing stress from persistent demands or situations. This type can negatively impact
          health if not managed.
        </p>
        <p>
          <b>Eustress:</b> Positive stress that motivates and energizes, such as starting a new job or taking on a challenge.
        </p>
        <p>
          <b>Distress:</b> Negative stress that feels overwhelming or harmful, such as excessive work demands or relationship
          conflicts.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Stress Response</h3>
        <p>
          When you encounter a stressor, your body activates the "fight-or-flight" response:
        </p>
        <ul>
          <li>
            <b>Physiological changes:</b> Increased heart rate, blood pressure, and cortisol levels; rapid breathing; muscle
            tension
          </li>
          <li>
            <b>Psychological changes:</b> Heightened alertness, focused attention, emotional reactions
          </li>
          <li>
            <b>Behavioral changes:</b> Increased activity, avoidance, or confrontation responses
          </li>
        </ul>
        <p>
          This response is adaptive in the short term but can be harmful if activated too frequently or for too long.
        </p>

        <hr />

        {/* RECOGNIZING STRESS */}
        <h2 id="recognizing-stress" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Recognizing Stress Patterns and Symptoms
        </h2>
        <p>
          Recognizing stress patterns helps you identify when stress is affecting your well-being and when intervention may be
          helpful.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Physical Symptoms</h3>
        <ul>
          <li>Headaches or muscle tension</li>
          <li>Fatigue or sleep disturbances</li>
          <li>Digestive issues</li>
          <li>Increased heart rate or blood pressure</li>
          <li>Weakened immune system</li>
          <li>Changes in appetite</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Emotional Symptoms</h3>
        <ul>
          <li>Anxiety, worry, or overwhelm</li>
          <li>Irritability or mood swings</li>
          <li>Feeling overwhelmed or unable to cope</li>
          <li>Difficulty concentrating or making decisions</li>
          <li>Feeling disconnected or isolated</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Behavioral Symptoms</h3>
        <ul>
          <li>Changes in sleep patterns</li>
          <li>Social withdrawal</li>
          <li>Increased use of substances (caffeine, alcohol)</li>
          <li>Procrastination or avoidance</li>
          <li>Changes in eating habits</li>
        </ul>

        <hr />

        {/* STRESS FACTORS */}
        <h2 id="stress-factors" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Factors Affecting Daily Stress Levels
        </h2>
        <p>
          Many factors can influence daily stress levels, and understanding these factors helps you identify sources of stress and
          develop targeted management strategies.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Work and Career</h3>
        <ul>
          <li>Excessive workload or time pressure</li>
          <li>Job insecurity or workplace conflicts</li>
          <li>Lack of control or autonomy</li>
          <li>Work-life imbalance</li>
          <li>Long commutes or demanding schedules</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Relationships and Social</h3>
        <ul>
          <li>Relationship conflicts or challenges</li>
          <li>Social isolation or lack of support</li>
          <li>Family responsibilities or caregiving</li>
          <li>Social expectations or pressure</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Health and Lifestyle</h3>
        <ul>
          <li>Sleep deprivation or poor sleep quality</li>
          <li>Lack of physical activity</li>
          <li>Poor nutrition or irregular eating</li>
          <li>Chronic health conditions</li>
          <li>Substance use or abuse</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Personal Factors</h3>
        <ul>
          <li>Perfectionism or high self-expectations</li>
          <li>Lack of time management skills</li>
          <li>Financial concerns</li>
          <li>Major life changes or transitions</li>
          <li>Trauma or past experiences</li>
        </ul>

        <hr />

        {/* STRESS MANAGEMENT */}
        <h2 id="stress-management" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Comprehensive Stress Management Strategies
        </h2>
        <p>
          Effective stress management involves multiple strategies that address different aspects of stress. Here are
          evidence-based approaches.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">1. Relaxation Techniques</h3>
        <ul>
          <li>
            <b>Deep breathing:</b> Practice slow, deep breathing to activate the relaxation response
          </li>
          <li>
            <b>Progressive muscle relaxation:</b> Systematically tense and relax muscle groups
          </li>
          <li>
            <b>Meditation or mindfulness:</b> Practice present-moment awareness and non-judgmental observation
          </li>
          <li>
            <b>Yoga or stretching:</b> Combine physical movement with breath awareness
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">2. Physical Activity</h3>
        <ul>
          <li>
            <b>Regular exercise:</b> Engage in moderate physical activity most days of the week
          </li>
          <li>
            <b>Movement breaks:</b> Take short walks or stretches throughout the day
          </li>
          <li>
            <b>Outdoor time:</b> Spend time in nature to reduce stress and improve mood
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">3. Time Management</h3>
        <ul>
          <li>
            <b>Prioritize tasks:</b> Focus on high-priority items and delegate when possible
          </li>
          <li>
            <b>Set boundaries:</b> Learn to say no and protect your time
          </li>
          <li>
            <b>Break tasks down:</b> Divide large projects into smaller, manageable steps
          </li>
          <li>
            <b>Schedule breaks:</b> Include regular rest periods in your day
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">4. Social Support</h3>
        <ul>
          <li>
            <b>Maintain relationships:</b> Stay connected with friends, family, and supportive people
          </li>
          <li>
            <b>Seek help:</b> Don't hesitate to ask for support when needed
          </li>
          <li>
            <b>Join communities:</b> Connect with groups that share your interests or challenges
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">5. Lifestyle Adjustments</h3>
        <ul>
          <li>
            <b>Sleep hygiene:</b> Prioritize quality sleep with consistent schedules and good sleep habits
          </li>
          <li>
            <b>Nutrition:</b> Eat balanced meals regularly and stay hydrated
          </li>
          <li>
            <b>Limit substances:</b> Reduce caffeine, alcohol, and other substances that can increase stress
          </li>
          <li>
            <b>Hobbies and interests:</b> Make time for activities that bring joy and relaxation
          </li>
        </ul>

        <hr />

        {/* BUILDING RESILIENCE */}
        <h2 id="building-resilience" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Building Stress Resilience and Coping Skills
        </h2>
        <p>
          Building resilience helps you adapt to stress and recover more quickly from challenging situations.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Cognitive Strategies</h3>
        <ul>
          <li>
            <b>Reframe perspectives:</b> Challenge negative thoughts and consider alternative viewpoints
          </li>
          <li>
            <b>Practice gratitude:</b> Focus on positive aspects of life and express appreciation
          </li>
          <li>
            <b>Set realistic expectations:</b> Accept that perfection is not necessary or possible
          </li>
          <li>
            <b>Develop problem-solving skills:</b> Approach challenges systematically and creatively
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Emotional Regulation</h3>
        <ul>
          <li>
            <b>Identify emotions:</b> Recognize and name your feelings without judgment
          </li>
          <li>
            <b>Express emotions:</b> Find healthy ways to express feelings, such as journaling or talking
          </li>
          <li>
            <b>Self-compassion:</b> Treat yourself with kindness and understanding during difficult times
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">When to Seek Professional Help</h3>
        <p>
          Consider seeking professional help if:
        </p>
        <ul>
          <li>Stress feels overwhelming or unmanageable</li>
          <li>Stress interferes with daily functioning, work, or relationships</li>
          <li>You experience persistent physical or emotional symptoms</li>
          <li>You use substances to cope with stress</li>
          <li>You have thoughts of self-harm or suicide</li>
        </ul>
        <p>
          Mental health professionals can provide personalized support, therapy, and treatment to help you manage stress effectively.
        </p>

        <hr />

        {/* CONCLUSION */}
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>
          Daily stress is a normal part of life, but understanding and managing it effectively is essential for overall well-being.
          By recognizing stress patterns, understanding factors that affect stress levels, and implementing comprehensive
          management strategies, you can build resilience and support your mental and physical health. Remember that stress
          management is an ongoing process, and what works may change over time. Be patient with yourself, experiment with
          different strategies, and seek professional support when needed. This tool is designed for wellness reflection and is not
          a substitute for professional mental health evaluation or treatment.
        </p>
      </section>

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
            This tool offers a stress tendency score from self-reflection questions as a gentle, lifestyle-oriented snapshot. It
            is intended for personal reflection, not for diagnosis or treatment decisions.
          </p>
          <p>
            Outputs include a stress tendency score (0-20), score percentage, wellness status, interpretation text, supportive
            recommendations, an action plan, and contextual information about the inputs and simple scoring approach.
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
