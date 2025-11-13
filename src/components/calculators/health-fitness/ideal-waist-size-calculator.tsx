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
import { Ruler, Activity, Calendar, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  gender: z.enum(['male', 'female']),
  height: z.number().positive(),
  weight: z.number().positive(),
  unit: z.enum(['metric', 'imperial']),
  currentWaist: z.number().positive(),
  age: z.number().min(18).max(100),
  ethnicity: z.enum(['caucasian', 'asian', 'african', 'hispanic', 'other']),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  idealWaist: number;
  maxWaist: number;
  currentWaist: number;
  difference: number;
  differencePercent: number;
  status: 'optimal' | 'elevated' | 'high_risk';
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
};

const understandingInputs = [
  {
    label: 'Gender',
    description: 'Men and women have different ideal waist-to-height ratios due to body composition differences.',
  },
  {
    label: 'Height',
    description: 'Ideal waist size is calculated as a percentage of your height, making it proportional to your body frame.',
  },
  {
    label: 'Current Waist Circumference',
    description: 'Measure at the narrowest point between your ribs and hips, or at the navel if no narrow point exists. Stand straight and measure after exhaling.',
  },
  {
    label: 'Ethnicity',
    description: 'Different ethnic groups have varying body compositions and metabolic risk factors, which influence ideal waist-to-height ratios.',
  },
  {
    label: 'Activity Level',
    description: 'Physical activity level helps contextualize recommendations for maintaining or improving waist circumference.',
  },
];

const faqs: [string, string][] = [
  [
    'What is the ideal waist size for my height?',
    'Ideal waist circumference is typically 40–45% of height for women and 42–45% for men, with slight variations by ethnicity. Asian populations may have lower thresholds (40–42% for women, 42% for men).',
  ],
  [
    'Why is waist size more important than BMI?',
    'Waist circumference directly measures abdominal fat (visceral fat), which is more strongly linked to metabolic disease, insulin resistance, and cardiovascular risk than overall body weight.',
  ],
  [
    'How do I measure my waist accurately?',
    'Use a flexible measuring tape at the narrowest point between your ribs and hips. If no narrow point exists, measure at the navel level. Stand straight, breathe normally, and measure after exhaling.',
  ],
  [
    'What waist size indicates health risk?',
    'Waist circumferences exceeding 50–53% of height for men and 48–51% for women indicate elevated cardiovascular and metabolic disease risk, especially when combined with other risk factors.',
  ],
  [
    'Can I reduce my waist size through exercise alone?',
    'Exercise helps, but reducing waist size requires a combination of calorie deficit, strength training (especially core work), cardiovascular exercise, and dietary changes to reduce abdominal fat.',
  ],
  [
    'How quickly can I reduce my waist circumference?',
    'Healthy waist reduction typically occurs at 0.5–1 inch (1–2.5 cm) per month with consistent diet and exercise. Rapid loss may reflect water weight rather than fat loss.',
  ],
  [
    'Does age affect ideal waist size?',
    'While the waist-to-height ratio remains consistent, older adults may have slightly different body composition. Focus on maintaining waist circumference within healthy ranges regardless of age.',
  ],
  [
    'Are there gender differences in waist size recommendations?',
    'Yes. Women typically have slightly lower ideal waist-to-height ratios (40–43%) compared to men (42–45%) due to differences in body fat distribution and metabolic risk thresholds.',
  ],
  [
    'What if my waist size is below the ideal range?',
    'Very low waist circumference may indicate underweight or muscle loss. Consult a healthcare provider if your waist is significantly below ideal ranges, especially if accompanied by other health concerns.',
  ],
  [
    'How often should I measure my waist?',
    'Measure monthly under consistent conditions (same time of day, same location). Daily fluctuations are normal; focus on trends over weeks and months rather than day-to-day changes.',
  ],
];

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Establish baseline: measure waist circumference accurately and track current diet and activity patterns.' },
  { week: 2, focus: 'Introduce 150 minutes of moderate-intensity cardio per week and reduce processed foods and added sugars.' },
  { week: 3, focus: 'Add strength training 2–3 times per week, focusing on core exercises and full-body movements.' },
  { week: 4, focus: 'Increase fiber intake to 25–30 g daily and prioritize whole foods over processed options.' },
  { week: 5, focus: 'Implement portion control strategies and practice mindful eating to reduce overall calorie intake.' },
  { week: 6, focus: 'Reassess waist measurement and adjust exercise intensity or dietary approach based on progress.' },
  { week: 7, focus: 'Focus on stress management and sleep quality, as both influence abdominal fat accumulation.' },
  { week: 8, focus: 'Establish long-term maintenance habits: continue regular measurements and sustainable lifestyle changes.' },
];

const warningSigns = () => [
  'Waist circumference exceeding 50–53% of height significantly increases risk of type 2 diabetes, cardiovascular disease, and metabolic syndrome.',
  'Rapid waist size increases may indicate fluid retention, hormonal changes, or underlying health conditions—consult a healthcare provider.',
  'Combining large waist size with high blood pressure, elevated blood sugar, or abnormal cholesterol requires medical evaluation.',
];

const calculateIdealWaist = (values: FormValues): ResultPayload => {
  let heightCm = values.height;
  let weightKg = values.weight;

  if (values.unit === 'imperial') {
    heightCm = values.height * 2.54;
    weightKg = values.weight * 0.453592;
  }

  const bmi = weightKg / ((heightCm / 100) ** 2);

  let idealWaistCm: number;
  let maxWaistCm: number;

  if (values.gender === 'male') {
    if (values.ethnicity === 'asian') {
      idealWaistCm = heightCm * 0.42;
      maxWaistCm = heightCm * 0.50;
    } else {
      idealWaistCm = heightCm * 0.45;
      maxWaistCm = heightCm * 0.53;
    }
  } else {
    if (values.ethnicity === 'asian') {
      idealWaistCm = heightCm * 0.40;
      maxWaistCm = heightCm * 0.48;
    } else {
      idealWaistCm = heightCm * 0.43;
      maxWaistCm = heightCm * 0.51;
    }
  }

  let idealWaist = idealWaistCm;
  let maxWaist = maxWaistCm;
  let currentWaistCm = values.currentWaist;

  if (values.unit === 'imperial') {
    idealWaist = idealWaistCm / 2.54;
    maxWaist = maxWaistCm / 2.54;
    currentWaistCm = values.currentWaist * 2.54;
  }

  let status: 'optimal' | 'elevated' | 'high_risk' = 'optimal';
  let interpretation = 'Your waist circumference is within the healthy range for your height and gender. Maintain your current lifestyle to preserve this status.';

  if (currentWaistCm > maxWaistCm) {
    status = 'high_risk';
    interpretation =
      'Your waist circumference indicates high risk for metabolic and cardiovascular diseases. Immediate lifestyle changes and consultation with a healthcare provider are recommended.';
  } else if (currentWaistCm > idealWaistCm * 1.1) {
    status = 'elevated';
    interpretation =
      'Your waist circumference is above the ideal range and may increase health risks. Moderate lifestyle modifications are suggested to reduce abdominal fat.';
  }

  const difference = values.currentWaist - idealWaist;
  const differencePercent = ((values.currentWaist - idealWaist) / idealWaist) * 100;

  const recommendations: string[] = [];
  if (status === 'high_risk') {
    recommendations.push('Immediate lifestyle changes recommended—consult with a healthcare provider for a personalized plan.');
    recommendations.push('Focus on reducing abdominal fat through a combination of diet modification and regular exercise.');
    recommendations.push('Prioritize whole foods, reduce processed foods, and aim for a moderate calorie deficit.');
  } else if (status === 'elevated') {
    recommendations.push('Moderate lifestyle modifications suggested to bring waist size into the ideal range.');
    recommendations.push('Increase physical activity, especially core-strengthening and cardiovascular exercises.');
    recommendations.push('Monitor waist circumference monthly and track progress toward your ideal size.');
  } else {
    recommendations.push('Maintain your current healthy lifestyle and continue regular exercise and balanced diet.');
    recommendations.push('Monitor waist size periodically to prevent future increases.');
    recommendations.push('Continue strength training and cardiovascular exercise to preserve muscle mass and metabolic health.');
  }

  if (difference > 0) {
    recommendations.push(
      `Aim to reduce waist circumference by approximately ${Math.abs(difference).toFixed(1)} ${values.unit === 'imperial' ? 'inches' : 'cm'} to reach the ideal range.`,
    );
  }

  if (values.activityLevel === 'sedentary') {
    recommendations.push('Increase daily physical activity—aim for at least 150 minutes of moderate-intensity exercise per week.');
  }

  return {
    idealWaist,
    maxWaist,
    currentWaist: values.currentWaist,
    difference,
    differencePercent,
    status,
    interpretation,
    recommendations,
    warningSigns: warningSigns(),
    plan: plan(),
  };
};

export default function IdealWaistSizeCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: undefined,
      height: undefined,
      weight: undefined,
      unit: 'metric',
      currentWaist: undefined,
      age: undefined,
      ethnicity: undefined,
      activityLevel: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(calculateIdealWaist(values));
  };

  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Ruler className="h-5 w-5" /> Ideal Waist Size Calculator</CardTitle>
          <CardDescription>Calculate your ideal waist circumference based on height, gender, and ethnicity to assess metabolic health risk.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <FormField control={form.control} name="unit" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit System</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit system" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="metric">Metric (cm, kg)</SelectItem>
                        <SelectItem value="imperial">Imperial (inches, lbs)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="height" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height ({unit === 'metric' ? 'cm' : 'inches'})</FormLabel>
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
                <FormField control={form.control} name="weight" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight ({unit === 'metric' ? 'kg' : 'lbs'})</FormLabel>
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
                <FormField control={form.control} name="currentWaist" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Waist Circumference ({unit === 'metric' ? 'cm' : 'inches'})</FormLabel>
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
                <FormField control={form.control} name="ethnicity" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ethnicity</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ethnicity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="caucasian">Caucasian</SelectItem>
                        <SelectItem value="asian">Asian</SelectItem>
                        <SelectItem value="african">African</SelectItem>
                        <SelectItem value="hispanic">Hispanic</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="activityLevel" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select activity level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary</SelectItem>
                        <SelectItem value="light">Light Activity</SelectItem>
                        <SelectItem value="moderate">Moderate Activity</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="very_active">Very Active</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate Ideal Waist Size</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Activity className="h-8 w-8 text-primary" /><CardTitle>Waist Size Analysis</CardTitle></div>
              <CardDescription>Your waist circumference assessment and health risk evaluation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Current Waist</h4>
                  <p className="text-2xl font-bold">{result.currentWaist.toFixed(1)} {unit === 'metric' ? 'cm' : 'in'}</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Ideal Waist</h4>
                  <p className="text-2xl font-bold text-primary">{result.idealWaist.toFixed(1)} {unit === 'metric' ? 'cm' : 'in'}</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Maximum Safe</h4>
                  <p className="text-2xl font-bold text-orange-600">{result.maxWaist.toFixed(1)} {unit === 'metric' ? 'cm' : 'in'}</p>
                </div>
              </div>
              <div className={`p-4 rounded-lg border ${
                result.status === 'optimal' ? 'bg-green-50 border-green-200' :
                result.status === 'elevated' ? 'bg-orange-50 border-orange-200' :
                'bg-red-50 border-red-200'
              }`}>
                <p className={`font-semibold ${
                  result.status === 'optimal' ? 'text-green-600' :
                  result.status === 'elevated' ? 'text-orange-600' :
                  'text-red-600'
                }`}>
                  {result.status === 'optimal' && 'Optimal Waist Size'}
                  {result.status === 'elevated' && 'Elevated Risk'}
                  {result.status === 'high_risk' && 'High Risk'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{result.interpretation}</p>
              </div>
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
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Waist Reduction Plan</CardTitle>
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
                <Link href="/category/health-fitness/bmi-calculator" className="text-primary hover:underline">
                  BMI Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Evaluate overall body weight status alongside waist measurements.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/body-fat-percentage-calculator" className="text-primary hover:underline">
                  Body Fat Percentage Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Assess total body composition and fat distribution.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Guide: Understanding Ideal Waist Size</CardTitle>
          <CardDescription>Evidence-based strategies for metabolic health</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            Waist circumference is a powerful indicator of metabolic health, often more predictive than BMI alone. It directly measures abdominal fat (visceral fat), which is strongly linked to insulin resistance, type 2 diabetes, cardiovascular disease, and metabolic syndrome. The ideal waist-to-height ratio varies by gender and ethnicity, with Asian populations typically having lower thresholds.
          </p>
          <p>
            To reduce waist size, combine a moderate calorie deficit with regular strength training (especially core work), cardiovascular exercise, and stress management. Focus on whole foods, adequate protein, and sufficient sleep. Measure monthly under consistent conditions and track trends over time rather than daily fluctuations.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Common questions about waist size and health</CardDescription>
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
