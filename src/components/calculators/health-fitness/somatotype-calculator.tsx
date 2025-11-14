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
import { User, Activity, Calendar, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  height: z.number().positive('Height must be positive'),
  weight: z.number().positive('Weight must be positive'),
  wristCircumference: z.number().positive('Wrist circumference must be positive'),
  ankleCircumference: z.number().positive('Ankle circumference must be positive'),
  gender: z.enum(['male', 'female']),
  age: z.number().positive('Age must be positive'),
  unitSystem: z.enum(['metric', 'imperial']),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  ectomorph: number;
  mesomorph: number;
  endomorph: number;
  primaryType: string;
  secondaryType: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  characteristics: string[];
};

const understandingInputs = [
  {
    label: 'Height & Weight',
    description: 'Used to calculate BMI and height-to-weight ratio, which contribute to ectomorphy (linearity) and endomorphy (adiposity) scores.',
  },
  {
    label: 'Wrist Circumference',
    description: 'Measured around the narrowest part of the wrist. Indicates bone structure and contributes to mesomorphy (muscularity) score.',
  },
  {
    label: 'Ankle Circumference',
    description: 'Measured around the narrowest part of the ankle. Also indicates bone structure and contributes to mesomorphy score.',
  },
  {
    label: 'Gender',
    description: 'Men and women have different somatotype distributions. Men tend to score higher in mesomorphy, while women may score higher in endomorphy.',
  },
  {
    label: 'Age',
    description: 'Somatotype can change with age due to muscle loss, fat gain, or lifestyle changes. Training and nutrition can influence all three components.',
  },
];

const faqs: [string, string][] = [
  [
    'What are somatotypes?',
    'Somatotypes are a classification system for human body types based on three components: ectomorphy (linearity/thinness), mesomorphy (muscularity), and endomorphy (adiposity/fatness). Each is scored 0–7.',
  ],
  [
    'What is an ectomorph?',
    'Ectomorphs are naturally thin, lean individuals with long limbs, narrow frames, fast metabolisms, and difficulty gaining weight or muscle. They typically excel in endurance activities.',
  ],
  [
    'What is a mesomorph?',
    'Mesomorphs are naturally muscular, athletic individuals with broad shoulders, narrow waists, and the ability to gain muscle easily. They typically excel in strength and power activities.',
  ],
  [
    'What is an endomorph?',
    'Endomorphs are naturally soft, round individuals with wider frames, slower metabolisms, and the ability to gain weight easily. They have good potential for building muscle mass.',
  ],
  [
    'Can I change my somatotype?',
    'While genetics play a role, training and nutrition can significantly influence all three components. Ectomorphs can build muscle, endomorphs can lose fat, and mesomorphs can optimize their natural advantages.',
  ],
  [
    'What is the best somatotype for athletes?',
    'It depends on the sport. Mesomorphs excel in strength/power sports, ectomorphs in endurance sports, and endomorphs in strength sports requiring mass. Most people are combinations.',
  ],
  [
    'How accurate is somatotype analysis?',
    'Somatotype analysis provides a useful framework but is not definitive. Most people are combinations of types, and training can shift scores over time.',
  ],
  [
    'What training is best for each somatotype?',
    'Ectomorphs: compound movements, caloric surplus, limited cardio. Mesomorphs: balanced approach, moderate volume. Endomorphs: higher volume, include cardio, monitor nutrition closely.',
  ],
  [
    'Can women be mesomorphs?',
    'Yes, though women typically score lower in mesomorphy than men due to hormonal differences. With training, women can develop significant mesomorphic characteristics.',
  ],
  [
    'Do somatotypes change with age?',
    'Yes. Muscle mass declines (lower mesomorphy), fat may increase (higher endomorphy), and bone structure changes can affect all three components. Training can mitigate these changes.',
  ],
];

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Establish baseline: measure all required inputs accurately and understand your current somatotype scores.' },
  { week: 2, focus: 'Design training program based on your primary type: ectomorphs focus on muscle building, mesomorphs on optimization, endomorphs on fat loss and muscle gain.' },
  { week: 3, focus: 'Optimize nutrition: ectomorphs need surplus calories, mesomorphs need balanced macros, endomorphs need controlled portions with adequate protein.' },
  { week: 4, focus: 'Implement progressive overload: increase training intensity, volume, or frequency based on your type and goals.' },
  { week: 5, focus: 'Track progress: measure body composition changes and adjust training/nutrition based on results.' },
  { week: 6, focus: 'Address weaknesses: ectomorphs add muscle, endomorphs reduce fat, mesomorphs optimize all aspects.' },
  { week: 7, focus: 'Reassess somatotype scores to see how training and nutrition have influenced your body composition.' },
  { week: 8, focus: 'Establish long-term habits: maintain consistent training and nutrition strategies tailored to your somatotype and goals.' },
];

const warningSigns = () => [
  'Somatotype analysis is a framework, not a limitation. Avoid using it as an excuse to avoid training or make unhealthy choices.',
  'Extreme focus on changing somatotype may lead to disordered eating or overtraining. Focus on health and performance, not just appearance.',
  'Somatotype scores can change with training, but genetics play a significant role. Set realistic expectations based on your natural body type.',
];

const calculateSomatotype = (values: FormValues) => {
  let h = values.height;
  let w = values.weight;
  let wrist = values.wristCircumference;
  let ankle = values.ankleCircumference;
  if (values.unitSystem === 'imperial') {
    h = values.height * 2.54;
    w = values.weight * 0.453592;
    wrist = values.wristCircumference * 2.54;
    ankle = values.ankleCircumference * 2.54;
  }
  const heightInMeters = h / 100;
  const bmi = w / (heightInMeters * heightInMeters);
  const heightWeightRatio = h / Math.pow(w, 1 / 3);
  let ectomorph = 0;
  if (heightWeightRatio >= 40.75) {
    ectomorph = 0.5 * heightWeightRatio - 20.375;
  } else {
    ectomorph = 0.5 * heightWeightRatio - 20.375;
  }
  ectomorph = Math.max(0, Math.min(7, ectomorph));
  let mesomorph = 0;
  if (values.gender === 'male') {
    mesomorph = 0.4 * (h / 100) + 0.858 * wrist + 0.601 * ankle + 0.188 * w + 0.161;
  } else {
    mesomorph = 0.4 * (h / 100) + 0.858 * wrist + 0.601 * ankle + 0.188 * w + 0.161;
  }
  mesomorph = Math.max(0, Math.min(7, mesomorph));
  let endomorph = 0;
  if (values.gender === 'male') {
    endomorph = -0.7182 + 0.1451 * bmi - 0.00068 * (bmi * bmi) + 0.0000014 * (bmi * bmi * bmi);
  } else {
    endomorph = -0.7182 + 0.1451 * bmi - 0.00068 * (bmi * bmi) + 0.0000014 * (bmi * bmi * bmi);
  }
  endomorph = Math.max(0, Math.min(7, endomorph));
  return {
    ectomorph: Math.round(ectomorph * 100) / 100,
    mesomorph: Math.round(mesomorph * 100) / 100,
    endomorph: Math.round(endomorph * 100) / 100,
  };
};

const getSomatotypeType = (ectomorph: number, mesomorph: number, endomorph: number) => {
  const max = Math.max(ectomorph, mesomorph, endomorph);
  let primaryType = '';
  let secondaryType = '';
  if (max === ectomorph) {
    primaryType = 'Ectomorph';
    secondaryType = mesomorph > endomorph ? 'Mesomorph' : 'Endomorph';
  } else if (max === mesomorph) {
    primaryType = 'Mesomorph';
    secondaryType = ectomorph > endomorph ? 'Ectomorph' : 'Endomorph';
  } else {
    primaryType = 'Endomorph';
    secondaryType = ectomorph > mesomorph ? 'Ectomorph' : 'Mesomorph';
  }
  return { primaryType, secondaryType };
};

const getCharacteristics = (primaryType: string) => {
  const characteristics = {
    Ectomorph: [
      'Naturally thin and lean',
      'Long limbs and narrow frame',
      'Fast metabolism',
      'Difficulty gaining weight and muscle',
      'Low body fat naturally',
      'May appear tall and lanky',
    ],
    Mesomorph: [
      'Naturally muscular and athletic',
      'Broad shoulders and narrow waist',
      'Gains muscle easily',
      'Moderate metabolism',
      'Well-defined muscles',
      'Strong and powerful build',
    ],
    Endomorph: [
      'Naturally soft and round',
      'Wider frame and joints',
      'Slower metabolism',
      'Gains weight easily',
      'Higher body fat naturally',
      'May struggle with weight loss',
    ],
  };
  return characteristics[primaryType as keyof typeof characteristics] || [];
};

const getInterpretation = (primaryType: string, secondaryType: string, ectomorph: number, mesomorph: number, endomorph: number) => {
  if (primaryType === 'Ectomorph') {
    return `You are primarily an Ectomorph with ${secondaryType} tendencies. This means you have a naturally thin, lean build with a fast metabolism. You may find it challenging to gain weight and muscle mass, but you likely have good endurance and stay lean easily.`;
  } else if (primaryType === 'Mesomorph') {
    return `You are primarily a Mesomorph with ${secondaryType} tendencies. This means you have a naturally athletic, muscular build that responds well to training. You likely gain muscle and strength relatively easily and have good athletic potential.`;
  } else {
    return `You are primarily an Endomorph with ${secondaryType} tendencies. This means you have a naturally softer, rounder build with a slower metabolism. You may gain weight easily but also have good potential for building muscle mass.`;
  }
};

const getRecommendations = (primaryType: string) => {
  if (primaryType === 'Ectomorph') {
    return [
      'Focus on compound movements for maximum muscle activation',
      'Eat in a caloric surplus with plenty of protein (1.6–2.2g per kg)',
      'Limit cardio to preserve calories for muscle building',
      'Train with moderate volume and focus on progressive overload',
      'Get adequate rest and recovery between sessions',
      'Consider shorter, more intense workouts',
    ];
  } else if (primaryType === 'Mesomorph') {
    return [
      'Take advantage of your natural athletic ability',
      'Focus on both strength and muscle building',
      'Use moderate to high training volume',
      'Include both compound and isolation exercises',
      'Maintain balanced nutrition with adequate protein',
      'Consider a variety of training modalities',
    ];
  } else {
    return [
      'Focus on strength training to build muscle mass',
      'Include regular cardiovascular exercise for fat loss',
      'Monitor caloric intake carefully',
      'Use higher training volume and frequency',
      'Focus on compound movements and functional training',
      'Consider intermittent fasting or structured meal timing',
    ];
  }
};

export default function SomatotypeCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      height: undefined,
      weight: undefined,
      wristCircumference: undefined,
      ankleCircumference: undefined,
      gender: undefined,
      age: undefined,
      unitSystem: 'metric',
    },
  });

  const onSubmit = (values: FormValues) => {
    const { ectomorph, mesomorph, endomorph } = calculateSomatotype(values);
    const { primaryType, secondaryType } = getSomatotypeType(ectomorph, mesomorph, endomorph);
    const interpretation = getInterpretation(primaryType, secondaryType, ectomorph, mesomorph, endomorph);
    const characteristics = getCharacteristics(primaryType);

    setResult({
      ectomorph,
      mesomorph,
      endomorph,
      primaryType,
      secondaryType,
      interpretation,
      recommendations: getRecommendations(primaryType),
      warningSigns: warningSigns(),
      plan: plan(),
      characteristics,
    });
  };

  const unit = form.watch('unitSystem');

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Somatotype Calculator</CardTitle>
          <CardDescription>Classify your body type (Ectomorph/Mesomorph/Endomorph) based on anthropometric measurements to guide training and nutrition.</CardDescription>
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
                        <SelectItem value="metric">Metric (cm, kg)</SelectItem>
                        <SelectItem value="imperial">Imperial (inches, lbs)</SelectItem>
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
                <FormField control={form.control} name="wristCircumference" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wrist Circumference ({unit === 'metric' ? 'cm' : 'inches'})</FormLabel>
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
                <FormField control={form.control} name="ankleCircumference" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ankle Circumference ({unit === 'metric' ? 'cm' : 'inches'})</FormLabel>
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
              <Button type="submit" className="w-full md:w-auto">Calculate Somatotype</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Activity className="h-8 w-8 text-primary" /><CardTitle>Somatotype Analysis</CardTitle></div>
              <CardDescription>Your body type classification and training recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded">
                  <p className="text-3xl font-bold text-primary">{result.ectomorph}</p>
                  <p className="text-sm text-muted-foreground">Ectomorph</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <p className="text-3xl font-bold text-primary">{result.mesomorph}</p>
                  <p className="text-sm text-muted-foreground">Mesomorph</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <p className="text-3xl font-bold text-primary">{result.endomorph}</p>
                  <p className="text-sm text-muted-foreground">Endomorph</p>
                </div>
              </div>
              <div className="text-center p-4 border rounded">
                <p className="text-xl font-bold text-primary">{result.primaryType}</p>
                <p className="text-sm text-muted-foreground">Primary Type (with {result.secondaryType} tendencies)</p>
              </div>
              <p className="text-sm text-muted-foreground">{result.interpretation}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Characteristics</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.characteristics.map((item, index) => (
                  <li key={index} className="text-sm text-muted-foreground">{item}</li>
                ))}
              </ul>
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
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Somatotype Optimization Plan</CardTitle>
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
              <p className="text-sm text-muted-foreground">Measure body fat to complement somatotype analysis.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/lean-body-mass-calculator" className="text-primary hover:underline">
                  Lean Body Mass Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Calculate lean body mass, which relates to mesomorphy scores.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/muscle-mass-percentage-calculator" className="text-primary hover:underline">
                  Muscle Mass Percentage Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Assess muscle development alongside somatotype classification.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/frame-size-calculator" className="text-primary hover:underline">
                  Frame Size Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Determine bone structure size, which influences somatotype scores.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Guide: Understanding Somatotypes</CardTitle>
          <CardDescription>Evidence-based strategies for body type optimization</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            Somatotypes are a classification system for human body types based on three components: ectomorphy (linearity), mesomorphy (muscularity), and endomorphy (adiposity). Each component is scored on a scale of 0–7. Most people are combinations of types rather than pure examples.
          </p>
          <p>
            While genetics play a role, training and nutrition can significantly influence all three components. Ectomorphs can build muscle with proper training and nutrition, endomorphs can lose fat and build muscle, and mesomorphs can optimize their natural advantages. Use your somatotype as a guide, not a limitation.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Common questions about somatotypes and body types</CardDescription>
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
