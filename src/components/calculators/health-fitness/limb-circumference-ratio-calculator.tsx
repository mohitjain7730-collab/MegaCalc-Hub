'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Calendar, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  upperArmCircumference: z.number().positive('Upper arm circumference must be positive'),
  forearmCircumference: z.number().positive('Forearm circumference must be positive'),
  thighCircumference: z.number().positive('Thigh circumference must be positive'),
  calfCircumference: z.number().positive('Calf circumference must be positive'),
  gender: z.enum(['male', 'female']),
  age: z.number().positive('Age must be positive'),
  unitSystem: z.enum(['metric', 'imperial']),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  upperToForearmRatio: number;
  thighToCalfRatio: number;
  armToLegRatio: number;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  symmetry: string;
};

const understandingInputs = [
  {
    label: 'Upper Arm Circumference',
    description: 'Measure at the largest point of the bicep (flexed or relaxed, but be consistent). This measurement reflects upper arm muscle development.',
  },
  {
    label: 'Forearm Circumference',
    description: 'Measure at the largest point of the forearm. This helps assess proportional development between upper and lower arm muscles.',
  },
  {
    label: 'Thigh Circumference',
    description: 'Measure at the largest point of the upper leg, typically just below the glutes. This reflects quadriceps and overall leg muscle development.',
  },
  {
    label: 'Calf Circumference',
    description: 'Measure at the largest point of the lower leg. This helps assess proportional development between upper and lower leg muscles.',
  },
  {
    label: 'Gender',
    description: 'Men and women have different typical limb proportions due to hormonal and structural differences.',
  },
];

const faqs: [string, string][] = [
  [
    'What are limb circumference ratios?',
    'Limb circumference ratios compare the size of different body parts (upper arm to forearm, thigh to calf, arm to leg) to assess muscle development balance and symmetry.',
  ],
  [
    'How do I measure limb circumferences accurately?',
    'Use a flexible measuring tape at the largest point of each limb. Measure consistently (same time of day, same state of flex/relax), and ensure the tape is snug but not tight.',
  ],
  [
    'What are normal limb ratio ranges?',
    'Normal ratios vary by gender: Upper Arm:Forearm is typically 1.5-1.7 (males) or 1.4-1.6 (females). Thigh:Calf is typically 1.3-1.5 (males) or 1.2-1.4 (females).',
  ],
  [
    'What do imbalanced ratios indicate?',
    'Imbalanced ratios may indicate uneven muscle development, which could benefit from targeted training to bring up weaker areas and improve overall symmetry.',
  ],
  [
    'Can limb ratios change with training?',
    'Yes, through targeted resistance training, you can improve muscle development in specific areas to achieve more balanced limb proportions over time.',
  ],
  [
    'How often should I measure limb circumferences?',
    'Monthly measurements are sufficient to track progress. Limb circumferences change slowly with muscle development, so frequent measurements aren\'t necessary.',
  ],
  [
    'Do limb ratios affect performance?',
    'Balanced limb proportions can contribute to better overall strength and athletic performance, while significant imbalances may indicate areas needing attention.',
  ],
  [
    'Should I focus on improving imbalanced ratios?',
    'Yes, addressing imbalances can improve overall muscle development, reduce injury risk, and create a more symmetrical physique. Focus on bringing up weaker areas.',
  ],
  [
    'What causes limb circumference imbalances?',
    'Imbalances can result from training preferences (favoring certain exercises), genetics, previous injuries, or lack of comprehensive training programs.',
  ],
  [
    'How do I improve limb symmetry?',
    'Use unilateral exercises (single-arm/leg), add extra volume for lagging body parts, ensure balanced training programs, and consider working with a trainer for guidance.',
  ],
];

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Measure all limb circumferences accurately and calculate current ratios to establish baseline symmetry assessment.' },
  { week: 2, focus: 'Identify lagging body parts based on ratio analysis and prioritize them in your training program.' },
  { week: 3, focus: 'Add extra training volume for weaker areas—2-3 additional sets per week for lagging body parts.' },
  { week: 4, focus: 'Incorporate unilateral exercises (single-arm/leg movements) to address imbalances and improve symmetry.' },
  { week: 5, focus: 'Adjust training frequency—train lagging body parts more often (2-3x per week) while maintaining other areas.' },
  { week: 6, focus: 'Focus on proper form and full range of motion to maximize muscle development in all areas.' },
  { week: 7, focus: 'Reassess limb circumferences and ratios to track progress toward improved symmetry.' },
  { week: 8, focus: 'Establish balanced training habits that maintain symmetry and prevent future imbalances.' },
];

const warningSigns = () => [
  'Limb circumference ratios are general guidelines and may vary based on genetics, training history, and individual body structure.',
  'Significant imbalances may indicate underlying issues—consult a healthcare provider or trainer if concerned about extreme asymmetries.',
  'Rapid changes in limb circumferences may indicate measurement errors or inconsistent measurement techniques—ensure consistent methods.',
];

export default function LimbCircumferenceRatioCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      upperArmCircumference: undefined,
      forearmCircumference: undefined,
      thighCircumference: undefined,
      calfCircumference: undefined,
      gender: undefined,
      age: undefined,
      unitSystem: 'metric',
    },
  });

  const calculateRatios = (values: FormValues) => {
    const upperToForearmRatio = values.upperArmCircumference / values.forearmCircumference;
    const thighToCalfRatio = values.thighCircumference / values.calfCircumference;
    const armToLegRatio = values.upperArmCircumference / values.thighCircumference;

    return {
      upperToForearmRatio: Math.round(upperToForearmRatio * 100) / 100,
      thighToCalfRatio: Math.round(thighToCalfRatio * 100) / 100,
      armToLegRatio: Math.round(armToLegRatio * 100) / 100,
    };
  };

  const getSymmetryAnalysis = (ratios: any, gender: string) => {
    const { upperToForearmRatio, thighToCalfRatio } = ratios;
    
    let symmetry = '';
    let interpretation = '';
    let recommendations: string[] = [];

    // Upper to forearm ratio analysis
    const upperForearmNormal = gender === 'male' ? 1.6 : 1.5;
    const upperForearmDiff = Math.abs(upperToForearmRatio - upperForearmNormal);
    
    // Thigh to calf ratio analysis
    const thighCalfNormal = gender === 'male' ? 1.4 : 1.3;
    const thighCalfDiff = Math.abs(thighToCalfRatio - thighCalfNormal);

    if (upperForearmDiff < 0.1 && thighCalfDiff < 0.1) {
      symmetry = 'Excellent';
      interpretation = 'Your limb proportions are well-balanced and symmetrical. This indicates good overall muscle development and proportional growth.';
      recommendations = [
        'Maintain your current training approach',
        'Focus on progressive overload',
        'Consider adding variety to prevent plateaus',
        'Continue balanced training of all muscle groups'
      ];
    } else if (upperForearmDiff < 0.2 && thighCalfDiff < 0.2) {
      symmetry = 'Good';
      interpretation = 'Your limb proportions are generally well-balanced with minor asymmetries. This is normal and within healthy ranges.';
      recommendations = [
        'Continue balanced training',
        'Address any minor imbalances with targeted exercises',
        'Monitor progress regularly',
        'Maintain consistent training frequency'
      ];
    } else {
      symmetry = 'Needs Improvement';
      interpretation = 'Your limb proportions show some imbalances that could benefit from targeted training. Focus on bringing up weaker areas.';
      recommendations = [
        'Identify and prioritize weaker muscle groups',
        'Add extra volume for lagging body parts',
        'Use unilateral exercises to address imbalances',
        'Consider working with a trainer for guidance'
      ];
    }

    return { symmetry, interpretation, recommendations };
  };

  const onSubmit = (values: FormValues) => {
    const ratios = calculateRatios(values);
    const { symmetry, interpretation, recommendations } = getSymmetryAnalysis(ratios, values.gender);

    setResult({
      ...ratios,
      interpretation,
      recommendations,
      warningSigns: warningSigns(),
      plan: plan(),
      symmetry,
    });
  };

  const unit = form.watch('unitSystem');

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Limb Circumference Ratio Calculator</CardTitle>
          <CardDescription>Analyze limb proportions to assess muscle development symmetry and identify areas for improvement.</CardDescription>
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
                <FormField control={form.control} name="upperArmCircumference" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upper Arm Circumference ({unit === 'metric' ? 'cm' : 'inches'})</FormLabel>
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
                <FormField control={form.control} name="forearmCircumference" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forearm Circumference ({unit === 'metric' ? 'cm' : 'inches'})</FormLabel>
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
                <FormField control={form.control} name="thighCircumference" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thigh Circumference ({unit === 'metric' ? 'cm' : 'inches'})</FormLabel>
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
                <FormField control={form.control} name="calfCircumference" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calf Circumference ({unit === 'metric' ? 'cm' : 'inches'})</FormLabel>
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
              <Button type="submit" className="w-full md:w-auto">Calculate Limb Ratios</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Activity className="h-8 w-8 text-primary" /><CardTitle>Limb Circumference Ratios</CardTitle></div>
              <CardDescription>Your limb proportion analysis and symmetry assessment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded">
                  <p className="text-2xl font-bold text-primary">{result.upperToForearmRatio}</p>
                  <p className="text-sm text-muted-foreground">Upper Arm : Forearm</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <p className="text-2xl font-bold text-primary">{result.thighToCalfRatio}</p>
                  <p className="text-sm text-muted-foreground">Thigh : Calf</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <p className="text-2xl font-bold text-primary">{result.armToLegRatio}</p>
                  <p className="text-sm text-muted-foreground">Arm : Leg</p>
                </div>
              </div>
              <div className="text-center p-4 border rounded">
                <p className="text-2xl font-bold text-primary">{result.symmetry}</p>
                <p className="text-sm text-muted-foreground">Overall Symmetry Rating</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{result.interpretation}</p>
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
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Symmetry Improvement Plan</CardTitle>
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
                <Link href="/category/health-fitness/muscle-mass-percentage-calculator" className="text-primary hover:underline">
                  Muscle Mass Percentage Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Assess overall muscle development alongside limb ratios.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/body-fat-percentage-calculator" className="text-primary hover:underline">
                  Body Fat Percentage Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Measure body composition to complement limb symmetry analysis.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/lean-body-mass-calculator" className="text-primary hover:underline">
                  Lean Body Mass Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Calculate lean body mass to understand overall muscle development.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/training-volume-calculator" className="text-primary hover:underline">
                  Training Volume Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Optimize training volume to address limb imbalances.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Guide: Understanding Limb Circumference Ratios</CardTitle>
          <CardDescription>Evidence-based information about limb proportions and symmetry</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            Limb circumference ratios help assess muscle development balance and symmetry by comparing the size of different body parts. They provide insight into whether your training is creating proportional muscle growth across different body parts.
          </p>
          <p>
            Normal ratio ranges vary by gender: Upper Arm:Forearm is typically 1.5-1.7 (males) or 1.4-1.6 (females), and Thigh:Calf is typically 1.3-1.5 (males) or 1.2-1.4 (females). Balanced ratios indicate proportional muscle development, while imbalanced ratios may suggest areas that need more attention in your training program.
          </p>
          <p>
            To improve limb symmetry, focus on identifying lagging body parts, adding extra training volume for weaker areas, using unilateral exercises, and ensuring balanced training programs that address all muscle groups.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Common questions about limb circumference ratios and symmetry</CardDescription>
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
