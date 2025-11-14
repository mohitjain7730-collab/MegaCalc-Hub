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
import { Heart, Activity, Calendar, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  age: z.number().min(18).max(120),
  gender: z.enum(['male', 'female']),
  weight: z.number().positive(),
  height: z.number().positive(),
  unit: z.enum(['metric', 'imperial']),
  bodyFatPercentage: z.number().min(0).max(100),
  method: z.enum(['manual', 'estimated']),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  fmi: number;
  fatMass: number;
  bmi: number;
  status: string;
  risk: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
};

const understandingInputs = [
  {
    label: 'Body Measurements',
    description: 'Weight and height are used to calculate BMI and provide context for body fat assessment. Use consistent units and accurate measurements.',
  },
  {
    label: 'Body Fat Percentage',
    description: 'Can be measured using DEXA, BIA, skinfold calipers, or estimated using formulas based on age, gender, and BMI. More accurate measurements provide better FMI assessment.',
  },
  {
    label: 'Age & Gender',
    description: 'Body fat distribution and healthy FMI ranges vary significantly by age and gender. Older adults and women typically have higher healthy FMI thresholds.',
  },
  {
    label: 'Assessment Method',
    description: 'Choose between manual entry of measured body fat percentage (from DEXA, BIA, etc.) or estimated calculation based on BMI, age, and gender.',
  },
];

const faqs: [string, string][] = [
  [
    'What is Fat Mass Index (FMI)?',
    'FMI is calculated as fat mass divided by height squared (kg/m²). It provides a more specific measure of body fat than BMI alone by focusing on fat mass rather than total body weight.',
  ],
  [
    'How is FMI different from BMI?',
    'BMI includes both muscle and fat mass, while FMI focuses specifically on fat mass. This makes FMI a better predictor of metabolic risk, especially for individuals with high muscle mass.',
  ],
  [
    'What is a healthy FMI range?',
    'For men under 30: 2.0–4.0 kg/m²; men 30–50: 2.5–4.5 kg/m²; men 50+: 3.0–5.0 kg/m². For women under 30: 3.0–5.0 kg/m²; women 30–50: 3.5–5.5 kg/m²; women 50+: 4.0–6.0 kg/m².',
  ],
  [
    'Why is FMI important for health?',
    'High FMI is associated with increased risk of type 2 diabetes, cardiovascular disease, metabolic syndrome, and chronic inflammation. It provides a more accurate assessment than BMI alone.',
  ],
  [
    'Can I have a high BMI but normal FMI?',
    'Yes. Athletes and individuals with high muscle mass may have elevated BMI but normal FMI, indicating healthy body composition despite higher total weight.',
  ],
  [
    'How can I reduce my FMI?',
    'Focus on fat loss through a moderate calorie deficit, resistance training to preserve muscle, cardiovascular exercise, adequate protein intake, and proper recovery.',
  ],
  [
    'What is the difference between fat mass and lean body mass?',
    'Fat mass is the total weight of body fat, while lean body mass includes muscle, bone, organs, and water. FMI focuses specifically on fat mass relative to height.',
  ],
  [
    'How often should I measure FMI?',
    'Monthly measurements are sufficient. FMI changes more slowly than weight alone. Focus on trends over weeks and months rather than day-to-day fluctuations.',
  ],
  [
    'Can FMI be too low?',
    'Yes. Very low FMI (<2.0 for men, <3.0 for women) may indicate underweight or insufficient body fat, which can affect hormone production, bone health, and immune function.',
  ],
  [
    'Is FMI more accurate than body fat percentage?',
    'FMI and body fat percentage measure different aspects. FMI accounts for height, making it useful for comparing individuals of different sizes. Both provide valuable insights when used together.',
  ],
];

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Establish baseline: measure body fat percentage accurately (DEXA, BIA, or calipers) and calculate current FMI.' },
  { week: 2, focus: 'Implement a moderate calorie deficit (200–500 calories) if FMI is elevated, focusing on whole foods and adequate protein.' },
  { week: 3, focus: 'Begin resistance training 3–4 times per week to preserve muscle mass while losing fat.' },
  { week: 4, focus: 'Add cardiovascular exercise 2–3 times per week (150 minutes total) to support fat loss and metabolic health.' },
  { week: 5, focus: 'Optimize nutrition: ensure adequate protein (1.6–2.2g per kg), fiber, and micronutrients while maintaining deficit.' },
  { week: 6, focus: 'Reassess FMI and adjust training/nutrition based on progress. Monitor both fat loss and muscle preservation.' },
  { week: 7, focus: 'Focus on recovery: 7–9 hours of sleep, stress management, and rest days to support sustainable fat loss.' },
  { week: 8, focus: 'Establish long-term maintenance habits: continue balanced training and nutrition to maintain healthy FMI.' },
];

const warningSigns = () => [
  'High FMI (>6.0 for men, >7.0 for women) significantly increases risk of type 2 diabetes, cardiovascular disease, and metabolic syndrome—consult a healthcare provider.',
  'Very low FMI (<2.0 for men, <3.0 for women) may indicate underweight or insufficient body fat, which can affect hormone production and bone health.',
  'Rapid changes in FMI without intentional intervention may indicate measurement errors, fluid retention, or underlying health conditions requiring medical evaluation.',
];

const calculateFatMassIndex = (values: FormValues) => {
  let weight, height;

  if (values.unit === 'metric') {
    weight = values.weight;
    height = values.height / 100;
  } else {
    weight = values.weight * 0.453592;
    height = values.height * 0.0254;
  }

  const fatMass = (values.bodyFatPercentage / 100) * weight;
  const fmi = fatMass / (height * height);
  const bmi = weight / (height * height);

  return { fmi, fatMass, bmi, weight, height };
};

const getFMIStatus = (fmi: number, gender: string, age: number) => {
  let thresholds;

  if (gender === 'male') {
    if (age < 30) {
      thresholds = { low: 2.0, moderate: 4.0, high: 6.0 };
    } else if (age < 50) {
      thresholds = { low: 2.5, moderate: 4.5, high: 6.5 };
    } else {
      thresholds = { low: 3.0, moderate: 5.0, high: 7.0 };
    }
  } else {
    if (age < 30) {
      thresholds = { low: 3.0, moderate: 5.0, high: 7.0 };
    } else if (age < 50) {
      thresholds = { low: 3.5, moderate: 5.5, high: 7.5 };
    } else {
      thresholds = { low: 4.0, moderate: 6.0, high: 8.0 };
    }
  }

  if (fmi < thresholds.low) {
    return {
      status: 'Low Fat Mass',
      risk: 'Low',
      interpretation:
        'Your FMI indicates very low body fat. While this may be appropriate for some athletes, ensure adequate nutrition and monitor for signs of insufficient body fat affecting health.',
    };
  }
  if (fmi < thresholds.moderate) {
    return {
      status: 'Normal Fat Mass',
      risk: 'Low',
      interpretation:
        'Your FMI is within the healthy range for your age and gender. This indicates good body composition and lower metabolic risk. Maintain your current lifestyle.',
    };
  }
  if (fmi < thresholds.high) {
    return {
      status: 'Moderate Fat Mass',
      risk: 'Moderate',
      interpretation:
        'Your FMI is elevated, indicating increased body fat relative to height. Consider lifestyle modifications including diet and exercise to reduce fat mass and improve metabolic health.',
    };
  }
  return {
    status: 'High Fat Mass',
    risk: 'High',
    interpretation:
      'Your FMI is significantly elevated, indicating high body fat relative to height. This increases risk of metabolic diseases. Comprehensive lifestyle intervention and medical evaluation are recommended.',
  };
};

const estimateBodyFatPercentage = (values: FormValues) => {
  let weight, height;

  if (values.unit === 'metric') {
    weight = values.weight;
    height = values.height / 100;
  } else {
    weight = values.weight * 0.453592;
    height = values.height * 0.0254;
  }

  const bmi = weight / (height * height);

  if (values.gender === 'male') {
    return Math.max(5, Math.min(35, 1.20 * bmi + 0.23 * values.age - 16.2));
  } else {
    return Math.max(8, Math.min(40, 1.20 * bmi + 0.23 * values.age - 5.4));
  }
};

const getRecommendations = (risk: string, status: string) => {
  const base = [
    'Focus on fat loss through a moderate calorie deficit (200–500 calories) while preserving muscle mass.',
    'Include resistance training 3–4 times per week to maintain muscle during fat loss.',
    'Add cardiovascular exercise 2–3 times per week (150 minutes total) to support fat loss and metabolic health.',
  ];

  if (risk === 'High' || status === 'High Fat Mass') {
    return [
      ...base,
      'Implement comprehensive lifestyle intervention: structured diet, regular exercise, and stress management.',
      'Consider medical evaluation and consultation with a registered dietitian or healthcare provider.',
      'Focus on sustainable, long-term changes rather than rapid weight loss.',
    ];
  }

  if (risk === 'Moderate' || status === 'Moderate Fat Mass') {
    return [
      ...base,
      'Monitor cardiovascular risk factors and consider regular health checkups.',
      'Focus on whole foods, adequate protein, and portion control.',
      'Establish consistent exercise habits and maintain them long-term.',
    ];
  }

  if (status === 'Low Fat Mass') {
    return [
      'Ensure adequate nutrition and energy intake to support health and performance.',
      'Monitor for signs of insufficient body fat affecting hormone production or bone health.',
      'Consider consulting with a healthcare provider if FMI is very low.',
      'Focus on balanced nutrition rather than further fat loss.',
    ];
  }

  return [
    ...base,
    'Maintain your current healthy lifestyle and body composition.',
    'Continue regular exercise and balanced nutrition to preserve healthy FMI.',
    'Monitor FMI periodically to track long-term trends.',
  ];
};

export default function FatMassIndexCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      gender: undefined,
      weight: undefined,
      height: undefined,
      unit: 'metric',
      bodyFatPercentage: undefined,
      method: 'manual',
    },
  });

  const onSubmit = (values: FormValues) => {
    let bodyFatPercentage = values.bodyFatPercentage;

    if (values.method === 'estimated') {
      bodyFatPercentage = estimateBodyFatPercentage(values);
    }

    const { fmi, fatMass, bmi } = calculateFatMassIndex({ ...values, bodyFatPercentage });
    const statusInfo = getFMIStatus(fmi, values.gender, values.age);

    setResult({
      fmi,
      fatMass,
      bmi,
      status: statusInfo.status,
      risk: statusInfo.risk,
      interpretation: statusInfo.interpretation,
      recommendations: getRecommendations(statusInfo.risk, statusInfo.status),
      warningSigns: warningSigns(),
      plan: plan(),
    });
  };

  const unit = form.watch('unit');
  const method = form.watch('method');

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5" /> Fat Mass Index Calculator</CardTitle>
          <CardDescription>Assess body fat mass relative to height to evaluate body composition and metabolic health risks more accurately than BMI alone.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                        <SelectItem value="imperial">Imperial (lbs, in)</SelectItem>
                      </SelectContent>
                    </Select>
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
                <FormField control={form.control} name="height" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height ({unit === 'metric' ? 'cm' : 'in'})</FormLabel>
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
                <FormField control={form.control} name="method" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assessment Method</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="manual">Manual Entry</SelectItem>
                        <SelectItem value="estimated">Estimated</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                {method === 'manual' && (
                  <FormField control={form.control} name="bodyFatPercentage" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body Fat Percentage (%)</FormLabel>
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
                )}
              </div>
              {method === 'estimated' && (
                <div className="text-sm text-muted-foreground p-4 bg-muted rounded">
                  <p>Body fat percentage will be estimated based on your age, gender, weight, and height using a validated formula.</p>
                </div>
              )}
              <Button type="submit" className="w-full md:w-auto">Calculate Fat Mass Index</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Activity className="h-8 w-8 text-primary" /><CardTitle>Fat Mass Index Assessment</CardTitle></div>
              <CardDescription>Your body fat analysis and health risk evaluation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Fat Mass Index</h4>
                  <p className="text-2xl font-bold text-primary">{result.fmi.toFixed(2)} kg/m²</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Fat Mass</h4>
                  <p className="text-2xl font-bold text-primary">{result.fatMass.toFixed(1)} kg</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">BMI</h4>
                  <p className="text-2xl font-bold text-primary">{result.bmi.toFixed(1)}</p>
                </div>
              </div>
              <div className={`p-4 rounded-lg border ${
                result.risk === 'Low' && result.status === 'Low Fat Mass' ? 'bg-blue-50 border-blue-200' :
                result.risk === 'Low' ? 'bg-green-50 border-green-200' :
                result.risk === 'Moderate' ? 'bg-yellow-50 border-yellow-200' :
                'bg-red-50 border-red-200'
              }`}>
                <p className={`font-semibold ${
                  result.risk === 'Low' && result.status === 'Low Fat Mass' ? 'text-blue-600' :
                  result.risk === 'Low' ? 'text-green-600' :
                  result.risk === 'Moderate' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {result.status}
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
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Fat Mass Reduction Plan</CardTitle>
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
                <Link href="/category/health-fitness/body-fat-percentage-calculator" className="text-primary hover:underline">
                  Body Fat Percentage Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Measure body fat percentage to calculate FMI accurately.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/lean-body-mass-calculator" className="text-primary hover:underline">
                  Lean Body Mass Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Calculate lean body mass to complement FMI assessment.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/bmi-calculator" className="text-primary hover:underline">
                  BMI Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Compare BMI with FMI to assess body composition more comprehensively.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/muscle-mass-percentage-calculator" className="text-primary hover:underline">
                  Muscle Mass Percentage Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Assess muscle development alongside fat mass for complete body composition analysis.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Guide: Understanding Fat Mass Index</CardTitle>
          <CardDescription>Evidence-based strategies for body composition optimization</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            Fat Mass Index (FMI) is calculated as fat mass divided by height squared (kg/m²). Unlike BMI, FMI focuses specifically on body fat rather than total body weight, making it a better predictor of metabolic risk, especially for individuals with high muscle mass.
          </p>
          <p>
            Healthy FMI ranges vary by age and gender. Men typically have lower thresholds (2.0–5.0 kg/m²) than women (3.0–6.0 kg/m²), and ranges increase slightly with age. High FMI is associated with increased risk of type 2 diabetes, cardiovascular disease, and metabolic syndrome.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Common questions about Fat Mass Index and body composition</CardDescription>
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
