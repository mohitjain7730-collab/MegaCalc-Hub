'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Activity, Calendar, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  hipCircumference: z.number().positive('Hip circumference must be positive'),
  shoulderWidth: z.number().positive('Shoulder width must be positive'),
  gender: z.enum(['male', 'female']),
  age: z.number().positive('Age must be positive'),
  unitSystem: z.enum(['metric', 'imperial']),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  hipShoulderRatio: number;
  bodyShape: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  aesthetic: string;
};

const understandingInputs = [
  {
    label: 'Hip Circumference',
    description: 'Measure around the widest part of your hips and buttocks. Ensure the tape is level and parallel to the floor.',
  },
  {
    label: 'Shoulder Width',
    description: 'Measure across the widest part of your shoulders (deltoids), typically from the outer edge of one shoulder to the other.',
  },
  {
    label: 'Gender',
    description: 'Men and women have different ideal proportions. Men typically have broader shoulders relative to hips (V-shape), while women often have more balanced or curvier proportions.',
  },
  {
    label: 'Age',
    description: 'Body proportions can change with age due to muscle loss, posture changes, or fat redistribution. Training can help maintain or improve proportions.',
  },
];

const faqs: [string, string][] = [
  [
    'What is hip-to-shoulder ratio?',
    'Hip-to-shoulder ratio is calculated by dividing hip circumference by shoulder width. It helps determine body shape (V-shaped, athletic, rectangular, pear-shaped, hourglass) and aesthetic proportions.',
  ],
  [
    'What is the ideal hip-to-shoulder ratio?',
    'For men, ratios below 0.9 create a V-shaped physique (ideal). For women, ratios around 0.9–1.0 create an hourglass figure (ideal). These ranges vary by individual goals and preferences.',
  ],
  [
    'Can I change my hip-to-shoulder ratio?',
    'Yes, through targeted training. Building shoulder and upper body width can lower the ratio, while hip-focused training can increase it. Genetics play a role, but training can significantly improve proportions.',
  ],
  [
    'What exercises build broader shoulders?',
    'Overhead presses, lateral raises, upright rows, pull-ups, and rowing exercises target the deltoids and upper back, creating the appearance of broader shoulders.',
  ],
  [
    'Does hip-to-shoulder ratio affect health?',
    'While primarily aesthetic, broader shoulders relative to hips (lower ratio) in men is associated with better strength, athletic performance, and metabolic health indicators.',
  ],
  [
    'How often should I measure hip and shoulder width?',
    'Measure monthly under consistent conditions. Focus on trends over weeks and months rather than day-to-day changes, as measurements can fluctuate slightly.',
  ],
  [
    'What body shapes are possible?',
    'V-shaped (broad shoulders, narrow hips), athletic (balanced), rectangular (similar measurements), pear-shaped (wider hips), and hourglass (balanced with defined waist) are common shapes.',
  ],
  [
    'Can women build broader shoulders?',
    'Yes, women can build shoulder width through resistance training. This can create a more athletic, balanced appearance and improve upper body strength.',
  ],
  [
    'Does posture affect shoulder width measurements?',
    'Yes. Poor posture (rounded shoulders) can make shoulders appear narrower. Improving posture through exercises can enhance the appearance of shoulder width.',
  ],
  [
    'Is hip-to-shoulder ratio more important than waist-to-hip ratio?',
    'They measure different aspects. Hip-to-shoulder ratio focuses on aesthetic proportions, while waist-to-hip ratio focuses on health risks. Both provide valuable insights.',
  ],
];

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Establish baseline: measure hip and shoulder width accurately and assess current body shape.' },
  { week: 2, focus: 'Begin shoulder-focused training: overhead presses, lateral raises, and rowing exercises 2–3 times per week.' },
  { week: 3, focus: 'Add upper back development: pull-ups, rows, and rear deltoid exercises to create broader appearance.' },
  { week: 4, focus: 'Focus on progressive overload: increase weight, reps, or sets each week to stimulate muscle growth.' },
  { week: 5, focus: 'Optimize nutrition: ensure adequate protein (1.6–2.2g per kg) and calories to support muscle development.' },
  { week: 6, focus: 'Reassess measurements and adjust training focus based on progress toward desired proportions.' },
  { week: 7, focus: 'Include posture correction exercises if needed: strengthen upper back and improve shoulder positioning.' },
  { week: 8, focus: 'Establish long-term maintenance: continue balanced training to maintain improved proportions and overall physique.' },
];

const warningSigns = () => [
  'Extreme focus on changing body proportions may lead to body dysmorphia or unhealthy training patterns—maintain a balanced approach to fitness.',
  'Rapid changes in measurements may indicate measurement errors or inconsistent technique—ensure consistent measurement methods.',
  'Ignoring lower body training to focus only on upper body can create muscle imbalances and increase injury risk—maintain balanced training.',
];

const calculateHipShoulderRatio = (values: FormValues) => {
  let hip = values.hipCircumference;
  let shoulder = values.shoulderWidth;
  if (values.unitSystem === 'imperial') {
    hip = values.hipCircumference * 2.54;
    shoulder = values.shoulderWidth * 2.54;
  }
  const ratio = hip / shoulder;
  return Math.round(ratio * 1000) / 1000;
};

const getBodyShape = (ratio: number, gender: string) => {
  if (gender === 'male') {
    if (ratio < 0.9) return 'V-Shaped (Broad Shoulders)';
    if (ratio < 1.0) return 'Athletic (Balanced)';
    if (ratio < 1.1) return 'Rectangular (Straight)';
    return 'Pear-Shaped (Wider Hips)';
  } else {
    if (ratio < 0.8) return 'Inverted Triangle (Broad Shoulders)';
    if (ratio < 0.9) return 'Athletic (Balanced)';
    if (ratio < 1.0) return 'Hourglass (Curved)';
    if (ratio < 1.1) return 'Pear-Shaped (Wider Hips)';
    return 'Apple-Shaped (Wide Hips)';
  }
};

const getAesthetic = (ratio: number, gender: string) => {
  if (gender === 'male') {
    if (ratio < 0.9) return 'Classic V-taper ideal for bodybuilding';
    if (ratio < 1.0) return 'Athletic and proportional';
    if (ratio < 1.1) return 'Balanced and functional';
    return 'May benefit from shoulder development';
  } else {
    if (ratio < 0.8) return 'Strong and athletic appearance';
    if (ratio < 0.9) return 'Balanced and proportional';
    if (ratio < 1.0) return 'Classic hourglass figure';
    if (ratio < 1.1) return 'Feminine and curvy';
    return 'May benefit from shoulder and back training';
  }
};

const getInterpretation = (ratio: number, gender: string, age: number) => {
  const bodyShape = getBodyShape(ratio, gender);
  const aesthetic = getAesthetic(ratio, gender);
  if (gender === 'male') {
    if (ratio < 0.9) {
      return `You have a classic V-shaped physique with broad shoulders relative to your hips. This is often considered the ideal male body shape and is associated with strength and athleticism. ${aesthetic}`;
    } else if (ratio < 1.0) {
      return `You have a well-balanced athletic build with proportional shoulders and hips. This creates a strong, functional appearance that works well for most activities. ${aesthetic}`;
    } else if (ratio < 1.1) {
      return `You have a more rectangular or straight body shape with relatively equal shoulder and hip measurements. This is a common and functional body type. ${aesthetic}`;
    } else {
      return `You have wider hips relative to your shoulders, creating a more pear-shaped appearance. This can be improved through targeted shoulder and upper body training. ${aesthetic}`;
    }
  } else {
    if (ratio < 0.8) {
      return `You have an inverted triangle shape with broad shoulders relative to your hips. This creates a strong, athletic appearance. ${aesthetic}`;
    } else if (ratio < 0.9) {
      return `You have a balanced athletic build with proportional shoulders and hips. This creates a strong, functional appearance. ${aesthetic}`;
    } else if (ratio < 1.0) {
      return `You have a classic hourglass figure with well-balanced shoulders and hips. This is often considered an ideal feminine body shape. ${aesthetic}`;
    } else if (ratio < 1.1) {
      return `You have a pear-shaped figure with wider hips relative to your shoulders. This creates a feminine, curvy appearance. ${aesthetic}`;
    } else {
      return `You have wider hips relative to your shoulders, creating a more apple-shaped appearance. This can be balanced through targeted upper body training. ${aesthetic}`;
    }
  }
};

const getRecommendations = (ratio: number, gender: string) => {
  if (gender === 'male') {
    if (ratio < 0.9) {
      return [
        'Maintain your excellent V-taper with balanced training',
        'Focus on maintaining shoulder width while building overall muscle',
        'Include exercises that enhance the V-shape (pull-ups, rows)',
        'Consider bodybuilding or physique competitions',
        'Continue balanced nutrition to support muscle development',
      ];
    } else if (ratio < 1.0) {
      return [
        'Maintain your balanced athletic build',
        'Focus on overall strength and muscle development',
        'Include both upper and lower body training',
        'Consider functional fitness and sports performance',
        'Maintain a balanced approach to training',
      ];
    } else {
      return [
        'Focus on shoulder and upper body development',
        'Include overhead presses, lateral raises, and pull-ups',
        'Work on building broader shoulders and a stronger back',
        'Consider reducing hip-focused exercises temporarily',
        'Focus on creating a more V-shaped silhouette',
      ];
    }
  } else {
    if (ratio < 0.8) {
      return [
        'Maintain your strong, athletic build',
        'Focus on balanced upper and lower body training',
        'Include exercises that enhance feminine curves',
        'Consider strength training and functional fitness',
        'Embrace your athletic physique',
      ];
    } else if (ratio < 1.0) {
      return [
        'Maintain your balanced, proportional build',
        'Focus on overall strength and fitness',
        'Include exercises that enhance your natural curves',
        'Consider a variety of training modalities',
        'Maintain a balanced approach to fitness',
      ];
    } else {
      return [
        'Focus on shoulder and upper body development',
        'Include overhead presses, lateral raises, and rows',
        'Work on building a stronger, more defined back',
        'Include exercises that create better proportions',
        'Focus on creating a more balanced silhouette',
      ];
    }
  }
};

export default function HipToShoulderRatioCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hipCircumference: undefined,
      shoulderWidth: undefined,
      gender: undefined,
      age: undefined,
      unitSystem: 'metric',
    },
  });

  const onSubmit = (values: FormValues) => {
    const hipShoulderRatio = calculateHipShoulderRatio(values);
    const bodyShape = getBodyShape(hipShoulderRatio, values.gender);
    const interpretation = getInterpretation(hipShoulderRatio, values.gender, values.age);
    const aesthetic = getAesthetic(hipShoulderRatio, values.gender);

    setResult({
      hipShoulderRatio,
      bodyShape,
      interpretation,
      recommendations: getRecommendations(hipShoulderRatio, values.gender),
      warningSigns: warningSigns(),
      plan: plan(),
      aesthetic,
    });
  };

  const unit = form.watch('unitSystem');

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Hip-to-Shoulder Ratio Calculator</CardTitle>
          <CardDescription>Assess your body shape and aesthetic proportions by comparing hip and shoulder measurements.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="unitSystem" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit System</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit system" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="metric">Metric (cm)</SelectItem>
                        <SelectItem value="imperial">Imperial (inches)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="gender" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="hipCircumference" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hip Circumference ({unit === 'metric' ? 'cm' : 'inches'})</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="shoulderWidth" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shoulder Width ({unit === 'metric' ? 'cm' : 'inches'})</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="age" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age (years)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate Hip-to-Shoulder Ratio</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Activity className="h-8 w-8 text-primary" /><CardTitle>Hip-to-Shoulder Ratio Analysis</CardTitle></div>
              <CardDescription>Your body shape assessment and aesthetic proportions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded">
                  <p className="text-3xl font-bold text-primary">{result.hipShoulderRatio}</p>
                  <p className="text-sm text-muted-foreground">Hip-to-Shoulder Ratio</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <p className="text-2xl font-bold text-primary">{result.bodyShape}</p>
                  <p className="text-sm text-muted-foreground">Body Shape</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{result.interpretation}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.recommendations.map((item, index) => (
                    <li key={index} className="text-sm text-muted-foreground">{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Warning Signs & Precautions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.warningSigns.map((item, index) => (
                    <li key={index} className="text-sm text-muted-foreground">{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Body Proportion Improvement Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Week</th>
                      <th className="text-left p-2">Focus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.plan.map(({ week, focus }) => (
                      <tr key={week} className="border-b">
                        <td className="p-2">{week}</td>
                        <td className="p-2">{focus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Understanding the Inputs</CardTitle>
          <CardDescription>Collect accurate measurements for meaningful results</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {understandingInputs.map((item, index) => (
              <li key={index}>
                <span className="font-semibold text-foreground">{item.label}:</span>
                <span className="text-sm text-muted-foreground"> {item.description}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Build a comprehensive body composition assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/waist-to-hip-ratio-calculator" className="text-primary hover:underline">
                  Waist-to-Hip Ratio Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Assess body fat distribution patterns and cardiovascular risk.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/body-fat-percentage-calculator" className="text-primary hover:underline">
                  Body Fat Percentage Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Measure total body fat to complement body shape analysis.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/somatotype-calculator" className="text-primary hover:underline">
                  Somatotype Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Classify your body type (ectomorph, mesomorph, endomorph) for training insights.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/muscle-mass-percentage-calculator" className="text-primary hover:underline">
                  Muscle Mass Percentage Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Assess muscle development alongside body shape proportions.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Guide: Understanding Body Proportions</CardTitle>
          <CardDescription>Evidence-based strategies for aesthetic and functional fitness</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            The hip-to-shoulder ratio is a key indicator of body shape and aesthetic proportions. It helps determine whether you have a V-shaped, athletic, rectangular, or pear-shaped physique, each with different training and styling implications.
          </p>
          <p>
            While primarily aesthetic, broader shoulders relative to hips (lower ratio) in men is associated with better strength, athletic performance, and metabolic health indicators. Training can significantly improve proportions through targeted shoulder and upper body development.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Common questions about body proportions and training</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map(([question, answer], index) => (
            <div key={index}>
              <h4 className="font-semibold mb-1">{question}</h4>
              <p className="text-sm text-muted-foreground">{answer}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
