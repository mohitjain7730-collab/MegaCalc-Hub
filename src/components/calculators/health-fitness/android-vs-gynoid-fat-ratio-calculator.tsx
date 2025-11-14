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
import { Target, Activity, Calendar, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  waistCircumference: z.number().positive('Waist circumference must be positive'),
  hipCircumference: z.number().positive('Hip circumference must be positive'),
  gender: z.enum(['male', 'female']),
  age: z.number().positive('Age must be positive'),
  unitSystem: z.enum(['metric', 'imperial']),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  androidGynoidRatio: number;
  fatDistribution: string;
  healthRisk: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  healthRisks: string[];
};

const understandingInputs = [
  {
    label: 'Waist Circumference',
    description: 'Measure at the narrowest point between your ribs and hips, or at the navel if no narrow point exists. Stand straight and measure after exhaling.',
  },
  {
    label: 'Hip Circumference',
    description: 'Measure around the widest part of your hips and buttocks. Ensure the tape is level and parallel to the floor.',
  },
  {
    label: 'Gender',
    description: 'Men and women have different fat distribution patterns and health risk thresholds. Android distribution is more common in men and postmenopausal women.',
  },
  {
    label: 'Age',
    description: 'Fat distribution patterns can change with age, especially after menopause in women. Health risk thresholds may adjust slightly with age.',
  },
];

const faqs: [string, string][] = [
  [
    'What is the difference between android and gynoid fat distribution?',
    'Android (apple-shaped) distribution stores fat around the waist and abdomen, while gynoid (pear-shaped) distribution stores fat around the hips and thighs. Android distribution carries higher health risks.',
  ],
  [
    'What is a healthy waist-to-hip ratio?',
    'For men, a ratio below 0.95 is considered healthy. For women, a ratio below 0.85 is considered healthy. Higher ratios indicate android distribution and increased health risks.',
  ],
  [
    'Why is android fat distribution more dangerous?',
    'Android distribution often includes visceral fat (around organs), which is metabolically active and increases inflammation, insulin resistance, and cardiovascular disease risk.',
  ],
  [
    'Can I change my fat distribution pattern?',
    'While genetics play a role, lifestyle changes (diet, exercise, stress management) can reduce abdominal fat and shift toward a healthier distribution pattern over time.',
  ],
  [
    'Does menopause affect fat distribution?',
    'Yes. After menopause, women often shift from gynoid to android distribution due to hormonal changes, increasing cardiovascular and metabolic disease risk.',
  ],
  [
    'What exercises help reduce android fat?',
    'High-intensity interval training (HIIT), strength training, and core exercises can help reduce abdominal fat. However, spot reduction is not possible—overall fat loss is needed.',
  ],
  [
    'How often should I measure my waist and hip circumference?',
    'Measure monthly under consistent conditions (same time of day, same location). Track trends over weeks and months rather than daily fluctuations.',
  ],
  [
    'Is waist-to-hip ratio more important than BMI?',
    'For metabolic health, waist-to-hip ratio and waist circumference are often more predictive than BMI alone, as they directly measure fat distribution patterns.',
  ],
  [
    'What health conditions are associated with android distribution?',
    'Type 2 diabetes, cardiovascular disease, metabolic syndrome, high blood pressure, stroke, and certain cancers are more common with android fat distribution.',
  ],
  [
    'Can stress affect fat distribution?',
    'Yes. Chronic stress increases cortisol, which promotes abdominal fat storage and can shift fat distribution toward android patterns, especially in women.',
  ],
];

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Establish baseline: measure waist and hip circumference accurately and track current diet and activity patterns.' },
  { week: 2, focus: 'Implement a moderate calorie deficit (if needed) and reduce processed foods, added sugars, and refined carbohydrates.' },
  { week: 3, focus: 'Introduce high-intensity interval training (HIIT) 2–3 times per week to target abdominal fat and improve metabolic health.' },
  { week: 4, focus: 'Add strength training 2–3 times per week, focusing on compound movements and core exercises.' },
  { week: 5, focus: 'Focus on stress management: meditation, adequate sleep (7–9 hours), and relaxation techniques to reduce cortisol levels.' },
  { week: 6, focus: 'Reassess waist and hip measurements and adjust exercise intensity or dietary approach based on progress.' },
  { week: 7, focus: 'Prioritize whole foods, adequate protein, and fiber to support satiety and metabolic health.' },
  { week: 8, focus: 'Establish long-term maintenance habits: continue regular measurements and sustainable lifestyle changes for lasting results.' },
];

const warningSigns = () => [
  'Waist-to-hip ratios exceeding 1.0 for men or 0.85 for women significantly increase risk of type 2 diabetes, cardiovascular disease, and metabolic syndrome.',
  'Rapid increases in waist circumference may indicate fluid retention, hormonal changes, or underlying health conditions—consult a healthcare provider.',
  'Combining android distribution with high blood pressure, elevated blood sugar, or abnormal cholesterol requires comprehensive medical evaluation and intervention.',
];

const calculateAndroidGynoidRatio = (values: FormValues) => {
  let waist = values.waistCircumference;
  let hip = values.hipCircumference;
  if (values.unitSystem === 'imperial') {
    waist = values.waistCircumference * 2.54;
    hip = values.hipCircumference * 2.54;
  }
  const ratio = waist / hip;
  return Math.round(ratio * 1000) / 1000;
};

const getFatDistribution = (ratio: number, gender: string) => {
  if (gender === 'male') {
    if (ratio > 1.0) return 'Android (Apple-shaped)';
    if (ratio > 0.9) return 'Mixed (Slight Android)';
    return 'Gynoid (Pear-shaped)';
  } else {
    if (ratio > 0.85) return 'Android (Apple-shaped)';
    if (ratio > 0.8) return 'Mixed (Slight Android)';
    return 'Gynoid (Pear-shaped)';
  }
};

const getHealthRisk = (ratio: number, gender: string, age: number) => {
  let riskThreshold = gender === 'male' ? 0.95 : 0.85;
  if (age > 50) riskThreshold += 0.05;
  if (ratio > riskThreshold + 0.1) return 'High Risk';
  if (ratio > riskThreshold) return 'Moderate Risk';
  return 'Low Risk';
};

const getInterpretation = (ratio: number, gender: string, age: number) => {
  const fatDistribution = getFatDistribution(ratio, gender);
  if (fatDistribution.includes('Android')) {
    return `You have an android (apple-shaped) fat distribution, which means you carry more fat around your waist and abdomen. This pattern is associated with higher health risks, particularly for cardiovascular disease and diabetes.`;
  } else if (fatDistribution.includes('Mixed')) {
    return `You have a mixed fat distribution with slight android tendencies. While not as high-risk as pure android distribution, you should monitor your waist circumference and maintain a healthy lifestyle.`;
  } else {
    return `You have a gynoid (pear-shaped) fat distribution, which means you carry more fat around your hips and thighs. This pattern is generally associated with lower health risks compared to android distribution.`;
  }
};

const getRecommendations = (healthRisk: string) => {
  if (healthRisk === 'High Risk') {
    return [
      'Focus on reducing waist circumference through targeted exercise and dietary changes',
      'Implement a calorie deficit diet to reduce overall body fat',
      'Include high-intensity interval training (HIIT) in your routine',
      'Reduce stress levels through meditation or relaxation techniques',
      'Limit processed foods and added sugars',
      'Consider consulting a healthcare provider for personalized advice',
    ];
  } else if (healthRisk === 'Moderate Risk') {
    return [
      'Maintain a balanced diet with plenty of fruits and vegetables',
      'Engage in regular cardiovascular exercise',
      'Include strength training to build muscle mass',
      'Monitor your waist circumference regularly',
      'Maintain a healthy weight',
      'Focus on stress management',
    ];
  } else {
    return [
      'Maintain your current healthy lifestyle',
      'Continue regular exercise and balanced nutrition',
      'Monitor your body composition regularly',
      'Focus on overall health and wellness',
      'Share your healthy habits with others',
    ];
  }
};

const getHealthRisks = (healthRisk: string) => {
  if (healthRisk === 'High Risk') {
    return [
      'Increased risk of cardiovascular disease',
      'Higher likelihood of type 2 diabetes',
      'Increased risk of metabolic syndrome',
      'Higher blood pressure and cholesterol levels',
      'Increased inflammation in the body',
      'Higher risk of certain cancers',
    ];
  } else if (healthRisk === 'Moderate Risk') {
    return [
      'Moderate risk of cardiovascular disease',
      'Potential for metabolic issues',
      'Increased inflammation markers',
      'Risk of developing diabetes over time',
    ];
  } else {
    return [
      'Lower risk of cardiovascular disease',
      'Better metabolic health',
      'Reduced inflammation',
      'Lower risk of diabetes',
    ];
  }
};

export default function AndroidVsGynoidFatRatioCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      waistCircumference: undefined,
      hipCircumference: undefined,
      gender: undefined,
      age: undefined,
      unitSystem: 'metric',
    },
  });

  const onSubmit = (values: FormValues) => {
    const androidGynoidRatio = calculateAndroidGynoidRatio(values);
    const fatDistribution = getFatDistribution(androidGynoidRatio, values.gender);
    const healthRisk = getHealthRisk(androidGynoidRatio, values.gender, values.age);
    const interpretation = getInterpretation(androidGynoidRatio, values.gender, values.age);

    setResult({
      androidGynoidRatio,
      fatDistribution,
      healthRisk,
      interpretation,
      recommendations: getRecommendations(healthRisk),
      warningSigns: warningSigns(),
      plan: plan(),
      healthRisks: getHealthRisks(healthRisk),
    });
  };

  const unit = form.watch('unitSystem');

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" /> Android vs Gynoid Fat Ratio Calculator</CardTitle>
          <CardDescription>Assess your fat distribution pattern (apple-shaped vs pear-shaped) to evaluate metabolic and cardiovascular health risks.</CardDescription>
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
                <FormField control={form.control} name="waistCircumference" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Waist Circumference ({unit === 'metric' ? 'cm' : 'inches'})</FormLabel>
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
              <Button type="submit" className="w-full md:w-auto">Calculate Android vs Gynoid Fat Ratio</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Activity className="h-8 w-8 text-primary" /><CardTitle>Android vs Gynoid Fat Distribution</CardTitle></div>
              <CardDescription>Your fat distribution pattern and health risk assessment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded">
                  <p className="text-3xl font-bold text-primary">{result.androidGynoidRatio}</p>
                  <p className="text-sm text-muted-foreground">Android/Gynoid Ratio</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <p className="text-2xl font-bold text-primary">{result.fatDistribution}</p>
                  <p className="text-sm text-muted-foreground">Fat Distribution Pattern</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <p className={`text-2xl font-bold ${
                    result.healthRisk === 'High Risk' ? 'text-red-600' :
                    result.healthRisk === 'Moderate Risk' ? 'text-orange-600' :
                    'text-green-600'
                  }`}>{result.healthRisk}</p>
                  <p className="text-sm text-muted-foreground">Health Risk Level</p>
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
                <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Warning Signs & Health Risks</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.warningSigns.map((item, index) => (
                    <li key={index} className="text-sm text-muted-foreground">{item}</li>
                  ))}
                </ul>
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Associated Health Risks:</h4>
                  <ul className="space-y-1">
                    {result.healthRisks.map((item, index) => (
                      <li key={index} className="text-sm text-muted-foreground">{item}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Fat Distribution Optimization Plan</CardTitle>
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
                <Link href="/category/health-fitness/waist-to-height-ratio-calculator" className="text-primary hover:underline">
                  Waist-to-Height Ratio Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Compare waist circumference relative to height for metabolic health.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/body-fat-percentage-calculator" className="text-primary hover:underline">
                  Body Fat Percentage Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Measure total body fat to complement fat distribution analysis.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/metabolic-syndrome-risk-calculator" className="text-primary hover:underline">
                  Metabolic Syndrome Risk Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Assess metabolic syndrome risk, which is strongly linked to android fat distribution.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Guide: Understanding Fat Distribution Patterns</CardTitle>
          <CardDescription>Evidence-based strategies for metabolic health</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            Fat distribution refers to where your body stores excess fat. Android (apple-shaped) distribution stores fat around the waist and abdomen, while gynoid (pear-shaped) distribution stores fat around the hips and thighs. The pattern of fat storage is more important for health than the total amount of fat.
          </p>
          <p>
            Android distribution is associated with higher health risks because it often includes visceral fat (around organs), which is metabolically active and increases inflammation, insulin resistance, and cardiovascular disease risk. Lifestyle changes including diet, exercise, and stress management can help shift toward a healthier distribution pattern.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Common questions about fat distribution and health</CardDescription>
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
