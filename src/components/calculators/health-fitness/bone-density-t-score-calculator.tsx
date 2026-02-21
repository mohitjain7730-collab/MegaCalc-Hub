'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Zap, Target, AlertTriangle, Shield, Bone } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

// Lifestyleâ€‘focused, nonâ€‘diagnostic inputs
const formSchema = z.object({
  weightBearingDays: z.number().min(0).max(7),
  strengthTrainingDays: z.number().min(0).max(7),
  calciumRichMealsPerDay: z.number().min(0).max(5),
  sunlightMinutesPerDay: z.number().min(0).max(180),
  sedentaryHoursPerDay: z.number().min(0).max(16),
});

type FormValues = z.infer<typeof formSchema>;

type BoneWellnessResult = {
  wellnessScore: number;
  levelText: string;
  summary: string;
  suggestions: string[];
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter days per week you do weight-bearing movement (walking, dancing, etc.).',
  'Enter days per week you do strength or resistance exercises.',
  'Enter meals or snacks per day that include bone-supportive foods.',
  'Enter average minutes per day spent outdoors or in natural light.',
  'Enter approximate hours per day mostly sitting.',
  'Review wellness score, lifestyle perspective, and recommendations.',
];

const faqs = [
  {
    question: 'What is bone strength lifestyle insight?',
    answer:
      'Bone strength lifestyle insight is a wellness-oriented reflection on lifestyle habits that can support bone health, including weight-bearing movement, strength training, nutrition, sunlight exposure, and sedentary time. It is not a medical assessment or diagnosis.',
  },
  {
    question: 'What factors affect bone strength?',
    answer:
      'Bone strength is influenced by weight-bearing exercise, strength training, adequate nutrition (especially calcium and vitamin D), sunlight exposure for vitamin D production, hormonal factors, age, genetics, and lifestyle habits like smoking and alcohol consumption.',
  },
  {
    question: 'How much weight-bearing exercise is recommended?',
    answer:
      'Guidelines suggest at least 30 minutes of weight-bearing exercise most days of the week (at least 3-4 days). Activities include walking, jogging, dancing, hiking, tennis, and stair climbing.',
  },
  {
    question: 'What is strength training for bones?',
    answer:
      'Strength or resistance training involves exercises that work against resistance, such as weight lifting, resistance bands, bodyweight exercises, or using weight machines. Aim for 2-3 sessions per week targeting major muscle groups.',
  },
  {
    question: 'What foods support bone health?',
    answer:
      'Bone-supportive foods include dairy products (milk, yogurt, cheese), leafy greens (kale, broccoli), fortified foods, fish with bones (sardines, salmon), nuts, seeds, and foods rich in calcium and vitamin D.',
  },
  {
    question: 'How much sunlight do I need for vitamin D?',
    answer:
      'Most people need 10-30 minutes of sun exposure 2-3 times per week on face, arms, and legs (without sunscreen) to produce adequate vitamin D. However, this varies by location, season, skin type, and time of day.',
  },
  {
    question: 'Can this tool diagnose osteoporosis or bone problems?',
    answer:
      'No. This tool provides general wellness insights about lifestyle habits and is not a medical assessment, diagnosis, or evaluation of bone density or health. For bone health concerns, consult a healthcare provider who can order appropriate tests.',
  },
  {
    question: 'What if my score is low?',
    answer:
      'A lower score suggests opportunities to add bone-supportive habits like more weight-bearing movement, strength training, bone-supportive nutrition, sunlight exposure, and reducing sedentary time. Consider gradual, sustainable changes rather than dramatic shifts.',
  },
  {
    question: 'How does age affect bone strength?',
    answer:
      'Bone density peaks in early adulthood and gradually declines with age, especially after menopause in women. However, lifestyle habits throughout life can support bone strength. It is never too late to adopt bone-supportive habits.',
  },
  {
    question: 'When should I consult a healthcare provider about bone health?',
    answer:
      'Consult a healthcare provider if you have risk factors for osteoporosis (family history, early menopause, certain medications), have experienced fractures, notice changes in posture or height, or want personalized bone health guidance and testing.',
  },
];

const relatedCalculators = [
  {
    name: 'Calcium Intake Calculator',
    slug: 'electrolyte-replacement-calculator',
    description: 'Assess daily calcium intake from foods.',
  },
  {
    name: 'Vitamin D Sun Exposure Calculator',
    slug: 'electrolyte-replacement-calculator',
    description: 'Calculate optimal sun exposure for vitamin D.',
  },
  {
    name: 'Exercise Calorie Burn Calculator',
    slug: 'mets-calories-burned-calculator',
    description: 'Track calories burned during exercise.',
  },
  {
    name: 'BMI Calculator',
    slug: 'bmi-calculator',
    description: 'Calculate body mass index for health assessment.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/bone-density-t-score-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Bone Strength Lifestyle Insight Tool', item: baseUrl },
      ],
    },
    {
      '@type': 'Article',
      headline: 'Bone Strength Lifestyle Insight Tool',
      description: 'Assess bone strength lifestyle factors from weight-bearing exercise, strength training, nutrition, sunlight, and sedentary time.',
      author: { '@type': 'Organization', name: 'Mycalculating.com' },
      publisher: { '@type': 'Organization', name: 'Mycalculating.com', logo: { '@type': 'ImageObject', url: 'https://mycalculating.com/logo.png' } },
      url: baseUrl,
      mainEntityOfPage: { '@type': 'WebPage', '@id': baseUrl },
      datePublished: '2024-01-01',
      dateModified: new Date().toISOString().split('T')[0],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Bone Strength Lifestyle Insight Tool',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Assess bone strength lifestyle factors from weight-bearing exercise, strength training, nutrition, sunlight, and sedentary time.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    },
    {
      '@type': 'HowTo',
      name: 'How to Use Bone Strength Lifestyle Insight Tool',
      description: 'Step-by-step guide to assess bone strength lifestyle factors',
      step: steps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        text: step,
      })),
    },
  ],
};

function calculateBoneWellness(values: FormValues): BoneWellnessResult {
  // Simple lifestyleâ€‘based wellness scoring (0â€“100), nonâ€‘diagnostic
  let score = 0;

  // Movement & loading
  score += Math.min(values.weightBearingDays * 8, 25); // up to 25 points
  score += Math.min(values.strengthTrainingDays * 8, 20); // up to 20 points

  // Nourishing meals
  score += Math.min(values.calciumRichMealsPerDay * 6, 20); // up to 20 points

  // Gentle sunlight / outdoor time
  const sunlightBuckets = Math.min(values.sunlightMinutesPerDay, 60) / 15; // cap at 60 min
  score += Math.min(sunlightBuckets * 4, 15); // up to 15 points

  // Sedentary time (less sitting = more points)
  const sedentaryPenalty = Math.max(0, values.sedentaryHoursPerDay - 4); // hours beyond 4
  score += Math.max(0, 20 - sedentaryPenalty * 4); // between 0â€“20

  // Clamp between 0â€“100
  const wellnessScore = Math.max(0, Math.min(100, Math.round(score)));

  let levelText = 'Gently building boneâ€‘supportive habits';
  let summary =
    'You have some helpful routines in place, and there is room to add small habits that support bone strength over time.';

  if (wellnessScore >= 75) {
    levelText = 'Strong foundation of boneâ€‘supportive habits';
    summary =
      'Your current routine includes many habits that can support bone strength, such as movement, nourishing meals, and time on your feet.';
  } else if (wellnessScore >= 50) {
    levelText = 'Growing boneâ€‘supportive lifestyle';
    summary =
      'You have a mix of helpful habits. Small, steady adjustments over time can further support your bones and overall movement.';
  } else {
    levelText = 'Plenty of room for gentle lifestyle support';
    summary =
      'This score simply reflects that there is space to experiment with supportive habits like more movement, standing breaks, or boneâ€‘friendly meals.';
  }

  const suggestions: string[] = [];

  if (values.weightBearingDays < 3) {
    suggestions.push('Consider adding short walks or other weightâ€‘bearing activities on a few more days each week.');
  }
  if (values.strengthTrainingDays < 2) {
    suggestions.push('Light strength or resistance exercises 1â€“2 times per week can gently support muscles and bones.');
  }
  if (values.calciumRichMealsPerDay < 2) {
    suggestions.push('You might include more foods that naturally contain calcium, if this fits your preferences and needs.');
  }
  if (values.sunlightMinutesPerDay < 15) {
    suggestions.push('When practical, brief time outdoors most days can be a simple, grounding habit.');
  }
  if (values.sedentaryHoursPerDay > 8) {
    suggestions.push('Standing up, stretching, or walking for a few minutes each hour can break up long sitting periods.');
  }

  if (suggestions.length === 0) {
    suggestions.push('You can keep leaning on the everyday habits that already help you feel steady and mobile.');
  }

  let status: BoneWellnessResult['status'] = 'optimal';
  let interpretation = summary;

  if (wellnessScore >= 75) {
    status = 'optimal';
    interpretation =
      'Your current routine includes many habits that can support bone strength, such as movement, nourishing meals, and time on your feet. You can continue maintaining these supportive patterns.';
  } else if (wellnessScore >= 50) {
    status = 'good';
    interpretation =
      'You have a mix of helpful habits. Small, steady adjustments over time can further support your bones and overall movement. Consider gradually adding more movement or bone-supportive foods.';
  } else if (wellnessScore >= 30) {
    status = 'moderate';
    interpretation =
      'This score reflects that there is space to experiment with supportive habits like more movement, standing breaks, or bone-friendly meals. Small, gradual changes can make a meaningful difference over time.';
  } else {
    status = 'low';
    interpretation =
      'This score simply reflects that there is space to experiment with supportive habits like more movement, standing breaks, or bone-friendly meals. Start with small, manageable changes and build gradually.';
  }

  const plan = [
    {
      label: 'This Week',
      detail:
        'Assess your current habits: notice your movement patterns, nutrition choices, sunlight exposure, and sedentary time. Identify one or two small changes you can make, such as adding a daily walk or including more calcium-rich foods.',
    },
    {
      label: 'This Month',
      detail:
        'Build bone-supportive habits: gradually increase weight-bearing movement to 3-4 days per week, add strength training 2 times per week, include bone-supportive foods regularly, get daily sunlight exposure, and reduce prolonged sitting.',
    },
    {
      label: 'Ongoing',
      detail:
        'Maintain bone-supportive lifestyle: continue regular weight-bearing exercise and strength training, maintain balanced nutrition with bone-supportive foods, ensure adequate sunlight exposure, and keep active throughout the day. Remember that bone health is supported by consistent habits over time.',
    },
  ];

  return { wellnessScore, levelText, summary, suggestions, status, interpretation, plan };
}

export default function BoneDensityTScoreCalculator() {
  const [results, setResults] = useState<BoneWellnessResult | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weightBearingDays: undefined,
      strengthTrainingDays: undefined,
      calciumRichMealsPerDay: undefined,
      sunlightMinutesPerDay: undefined,
      sedentaryHoursPerDay: undefined,
    },
  });

  const onSubmit = (v: FormValues) => {
    const calc = calculateBoneWellness(v);
    setResults(calc);
  };

  return (
    <div className="space-y-8">
      <Script
        id="bone-density-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bone className="h-5 w-5" />
            Bone Strength Lifestyle Insight Tool
          </CardTitle>
          <CardDescription>
            Get general wellness insights about bone strength lifestyle factors from movement, nutrition, sunlight, and activity
            patterns. This is a personal lifestyle insight, not a medical evaluation.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your bone strength lifestyle data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="weightBearingDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Days per week you do weightâ€‘bearing movement (walking, dancing, etc.)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(parseInt(e.target.value || '0', 10) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="strengthTrainingDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Days per week you do strength or resistance exercises</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(parseInt(e.target.value || '0', 10) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="calciumRichMealsPerDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meals or snacks per day that include boneâ€‘supportive foods</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(parseInt(e.target.value || '0', 10) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sunlightMinutesPerDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Average minutes per day spent outdoors or in natural light</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(parseInt(e.target.value || '0', 10) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sedentaryHoursPerDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Approximate hours per day mostly sitting</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(parseFloat(e.target.value || '0') || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" className="w-full md:w-auto">
            Calculate bone strength insight
          </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Interactive results
            </CardTitle>
            <CardDescription>See wellness score, lifestyle perspective, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Wellness Score</p>
                <p className="text-2xl font-semibold text-primary">{results.wellnessScore}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{results.status}</p>
                <p className="text-xs text-muted-foreground">{results.interpretation}</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Pattern</p>
                <p className="text-2xl font-semibold text-primary">
                  {results.wellnessScore >= 75 ? 'Supportive' : results.wellnessScore >= 50 ? 'Growing' : 'Developing'}
                </p>
                <p className="text-xs text-muted-foreground">Lifestyle perspective</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Level</p>
                <p className="text-2xl font-semibold text-primary">{results.levelText}</p>
                <p className="text-xs text-muted-foreground">Overall assessment</p>
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
                    {results.suggestions.map((rec, i) => (
                      <li key={i}>{rec}</li>
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
                    {results.plan.map((step) => (
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
            <strong>Wellness Score</strong> = Sum of points from all lifestyle factors (0-100 scale). Points are awarded for:
            weight-bearing days (up to 25 points), strength training days (up to 20 points), calcium-rich meals (up to 20
            points), sunlight exposure (up to 15 points), and reduced sedentary time (up to 20 points).
          </p>
          <p>
            <strong>Weight-bearing movement:</strong> 8 points per day, capped at 25 points (3+ days = maximum).
          </p>
          <p>
            <strong>Strength training:</strong> 8 points per day, capped at 20 points (2+ days = maximum).
          </p>
          <p>
            <strong>Calcium-rich meals:</strong> 6 points per meal/snack, capped at 20 points.
          </p>
          <p>
            <strong>Sunlight exposure:</strong> 4 points per 15-minute block, capped at 15 points (60+ minutes = maximum).
          </p>
          <p>
            <strong>Sedentary time:</strong> 20 points minus 4 points per hour beyond 4 hours of sitting per day.
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
                <Link href={`/health-fitness/${calc.slug}`} className="text-primary hover:underline">
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
        <meta itemProp="name" content="The Definitive Guide to Bone Strength: Lifestyle Factors and Bone Health Support" />
        <meta
          itemProp="description"
          content="An expert, evidence-based guide on bone strength and bone health, detailing weight-bearing exercise, strength training, nutrition, sunlight exposure, and comprehensive strategies to support bone health throughout life."
        />
        <meta
          itemProp="keywords"
          content="bone strength calculator, bone health lifestyle, osteoporosis prevention, weight-bearing exercise, bone density, calcium intake, vitamin D, bone health strategies"
        />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/definitive-bone-strength-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          The Definitive Guide to Bone Strength: Understanding Lifestyle Factors and Supporting Bone Health
        </h1>
        <p className="text-lg italic text-gray-700">
          Explore the science of bone health, learn how lifestyle factors affect bone strength, understand the role of exercise,
          nutrition, and sunlight, and discover comprehensive strategies to support bone health throughout life.
        </p>

        {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li>
            <a href="#understanding-bones" className="hover:underline">
              Understanding Bone Health and Bone Strength
            </a>
          </li>
          <li>
            <a href="#exercise-bones" className="hover:underline">
              Exercise and Bone Strength: Weight-Bearing and Strength Training
            </a>
          </li>
          <li>
            <a href="#nutrition-bones" className="hover:underline">
              Nutrition for Bone Health: Calcium, Vitamin D, and More
            </a>
          </li>
          <li>
            <a href="#sunlight-vitamin-d" className="hover:underline">
              Sunlight Exposure and Vitamin D for Bone Health
            </a>
          </li>
          <li>
            <a href="#lifestyle-strategies" className="hover:underline">
              Comprehensive Lifestyle Strategies for Bone Health
            </a>
          </li>
        </ul>
        <hr />

        {/* UNDERSTANDING BONES */}
        <h2 id="understanding-bones" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Understanding Bone Health and Bone Strength
        </h2>
        <p>
          Bones are living tissue that constantly remodel throughout life. Bone strength depends on bone density (amount of bone
          tissue) and bone quality (structure and composition). Strong bones support mobility, protect organs, store minerals, and
          produce blood cells.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">How Bones Remodel</h3>
        <p>
          Bones undergo continuous remodeling through two processes:
        </p>
        <ul>
          <li>
            <b>Bone formation:</b> Cells called osteoblasts build new bone tissue
          </li>
          <li>
            <b>Bone resorption:</b> Cells called osteoclasts break down old bone tissue
          </li>
        </ul>
        <p>
          In healthy bones, formation and resorption are balanced. When resorption exceeds formation, bone density decreases,
          leading to weaker bones and increased fracture risk.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Peak Bone Mass and Age-Related Changes</h3>
        <p>
          Bone density peaks in early adulthood (around age 30) and gradually declines with age. Women experience accelerated bone
          loss after menopause due to decreased estrogen. However, lifestyle habits throughout life can support bone strength and
          slow age-related decline.
        </p>

        <hr />

        {/* EXERCISE AND BONES */}
        <h2 id="exercise-bones" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Exercise and Bone Strength: Weight-Bearing and Strength Training
        </h2>
        <p>
          Exercise is one of the most important factors for bone health. Weight-bearing exercise and strength training stimulate
          bone formation and help maintain bone density.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Weight-Bearing Exercise</h3>
        <p>
          Weight-bearing exercise involves activities where you support your body weight against gravity. These activities
          stimulate bone formation by applying stress to bones, which signals the body to strengthen them.
        </p>
        <p>
          <b>Examples:</b> Walking, jogging, dancing, hiking, tennis, stair climbing, jumping rope
        </p>
        <p>
          <b>Recommendation:</b> At least 30 minutes of weight-bearing exercise most days of the week (at least 3-4 days).
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Strength Training</h3>
        <p>
          Strength or resistance training involves exercises that work against resistance, such as weights, resistance bands, or
          bodyweight exercises. These activities build muscle and stimulate bone formation.
        </p>
        <p>
          <b>Examples:</b> Weight lifting, resistance band exercises, bodyweight exercises (push-ups, squats), using weight
          machines
        </p>
        <p>
          <b>Recommendation:</b> 2-3 strength training sessions per week targeting major muscle groups.
        </p>

        <hr />

        {/* NUTRITION FOR BONES */}
        <h2 id="nutrition-bones" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Nutrition for Bone Health: Calcium, Vitamin D, and More
        </h2>
        <p>
          Adequate nutrition is essential for bone health. Key nutrients include calcium, vitamin D, protein, magnesium, and
          other vitamins and minerals.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Calcium</h3>
        <p>
          Calcium is the primary mineral in bones. Adequate calcium intake is necessary for bone formation and maintenance.
        </p>
        <p>
          <b>Sources:</b> Dairy products (milk, yogurt, cheese), leafy greens (kale, broccoli), fortified foods, fish with bones
          (sardines, salmon), nuts, seeds
        </p>
        <p>
          <b>Recommendation:</b> Adults typically need 1000-1200 mg per day, depending on age and gender.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Vitamin D</h3>
        <p>
          Vitamin D helps the body absorb calcium and is essential for bone health. It can be obtained from sunlight exposure,
          foods, or supplements.
        </p>
        <p>
          <b>Sources:</b> Sunlight exposure, fatty fish, fortified foods (milk, cereals), egg yolks, supplements
        </p>
        <p>
          <b>Recommendation:</b> Most adults need 600-800 IU per day, though needs vary by location, season, and individual
          factors.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Protein</h3>
        <p>
          Protein is important for bone structure and muscle mass, which supports bone health. Adequate protein intake helps
          maintain bone strength.
        </p>

        <hr />

        {/* SUNLIGHT AND VITAMIN D */}
        <h2 id="sunlight-vitamin-d" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Sunlight Exposure and Vitamin D for Bone Health
        </h2>
        <p>
          Sunlight exposure is the primary natural source of vitamin D, which is essential for calcium absorption and bone
          health.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">How Sunlight Produces Vitamin D</h3>
        <p>
          When skin is exposed to UVB rays from sunlight, it produces vitamin D3. This process is influenced by:
        </p>
        <ul>
          <li>Time of day (peak hours: 10am-3pm)</li>
          <li>Season and latitude</li>
          <li>Skin type and color</li>
          <li>Amount of skin exposed</li>
          <li>Use of sunscreen</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Recommended Sunlight Exposure</h3>
        <p>
          Most people need 10-30 minutes of sun exposure 2-3 times per week on face, arms, and legs (without sunscreen) to
          produce adequate vitamin D. However, this varies significantly by location, season, and individual factors.
        </p>
        <p>
          <b>Balance:</b> Balance sun exposure for vitamin D with sun protection to reduce skin cancer risk. Consider vitamin D
          supplements if you limit sun exposure significantly.
        </p>

        <hr />

        {/* LIFESTYLE STRATEGIES */}
        <h2 id="lifestyle-strategies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Comprehensive Lifestyle Strategies for Bone Health
        </h2>
        <p>
          Supporting bone health involves multiple lifestyle factors working together. Here are comprehensive strategies.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">1. Regular Exercise</h3>
        <ul>
          <li>
            <b>Weight-bearing activities:</b> Include walking, jogging, dancing, or other weight-bearing exercises most days
          </li>
          <li>
            <b>Strength training:</b> Engage in resistance exercises 2-3 times per week
          </li>
          <li>
            <b>Balance exercises:</b> Include activities that improve balance to reduce fall risk
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">2. Balanced Nutrition</h3>
        <ul>
          <li>
            <b>Calcium-rich foods:</b> Include dairy, leafy greens, fortified foods regularly
          </li>
          <li>
            <b>Vitamin D:</b> Get sunlight exposure or consume fortified foods/supplements
          </li>
          <li>
            <b>Protein:</b> Ensure adequate protein intake for bone and muscle health
          </li>
          <li>
            <b>Variety:</b> Eat a balanced diet with fruits, vegetables, whole grains, and lean proteins
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">3. Reduce Sedentary Time</h3>
        <ul>
          <li>
            <b>Stand regularly:</b> Take breaks from sitting every hour
          </li>
          <li>
            <b>Move throughout the day:</b> Include short walks or stretches
          </li>
          <li>
            <b>Limit prolonged sitting:</b> Reduce extended periods of inactivity
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">4. Avoid Harmful Habits</h3>
        <ul>
          <li>
            <b>Limit alcohol:</b> Excessive alcohol can negatively affect bone health
          </li>
          <li>
            <b>Don't smoke:</b> Smoking is associated with decreased bone density
          </li>
          <li>
            <b>Maintain healthy weight:</b> Both underweight and excessive weight can affect bone health
          </li>
        </ul>

        <hr />

        {/* CONCLUSION */}
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>
          Bone strength is supported by a combination of weight-bearing exercise, strength training, adequate nutrition
          (especially calcium and vitamin D), sunlight exposure, and an active lifestyle. By understanding how these factors
          influence bone health and implementing comprehensive strategies, you can support bone strength throughout life. Remember
          that bone health is a long-term investmentâ€”consistent habits over time matter more than short-term changes. If you have
          concerns about bone health, risk factors for osteoporosis, or want personalized guidance, consult a healthcare provider
          who can assess your situation and recommend appropriate testing and interventions. This tool is designed for wellness
          reflection and is not a substitute for professional medical evaluation or bone density testing.
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
            This tool offers a bone strength wellness score from lifestyle factors as a gentle, lifestyle-oriented snapshot. It is
            intended for personal reflection, not for diagnosis or treatment decisions.
          </p>
          <p>
            Outputs include a wellness score (0-100), lifestyle perspective, interpretation text, supportive recommendations, an
            action plan, and contextual information about the inputs and simple scoring approach.
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

