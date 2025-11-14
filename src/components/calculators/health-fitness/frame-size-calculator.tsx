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
import { Ruler, Activity, Calendar, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  height: z.number().positive('Height must be positive'),
  wristCircumference: z.number().positive('Wrist circumference must be positive'),
  gender: z.enum(['male', 'female']),
  age: z.number().positive('Age must be positive'),
  unitSystem: z.enum(['metric', 'imperial']),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  frameSize: string;
  frameIndex: number;
  interpretation: string;
  idealWeightRange: {
    min: number;
    max: number;
  };
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  characteristics: string[];
};

const understandingInputs = [
  {
    label: 'Height',
    description: 'Your total height is used to calculate the frame index ratio. Measure accurately without shoes for best results.',
  },
  {
    label: 'Wrist Circumference',
    description: 'Measure at the narrowest part of your wrist using a flexible measuring tape. This measurement reflects bone structure size.',
  },
  {
    label: 'Gender',
    description: 'Frame size thresholds differ between men and women due to natural body structure differences.',
  },
  {
    label: 'Age',
    description: 'Age helps contextualize frame size assessment, as bone structure is fully developed by adulthood.',
  },
];

const faqs: [string, string][] = [
  [
    'What is frame size?',
    'Frame size refers to the relative size of your bone structure, determined by comparing your height to your wrist circumference. It helps assess ideal weight ranges and training approaches.',
  ],
  [
    'How do I measure my wrist circumference accurately?',
    'Use a flexible measuring tape at the narrowest part of your wrist. Measure on your dominant hand, ensure the tape is snug but not tight, and take the measurement in the morning for consistency.',
  ],
  [
    'What are the frame size categories?',
    'Frame sizes are categorized as Small (narrow bones, lighter build), Medium (average bone structure, balanced proportions), or Large (wide bones, heavier build).',
  ],
  [
    'How does frame size affect my ideal weight?',
    'Larger frames can support more weight due to heavier bone structure, while smaller frames typically have lower ideal weight ranges. Frame size helps determine appropriate weight ranges for your body type.',
  ],
  [
    'Can frame size change over time?',
    'No, frame size is determined by bone structure, which is fully developed by adulthood. However, muscle mass and body composition can change, affecting how your frame size appears.',
  ],
  [
    'Does frame size affect my training approach?',
    'Yes. Small frames may benefit from relative strength and endurance training, medium frames can use a balanced approach, and large frames may excel in absolute strength and power training.',
  ],
  [
    'Is frame size the same as body type?',
    'Frame size specifically refers to bone structure, while body type (somatotype) considers muscle mass, fat distribution, and overall body composition. They are related but different concepts.',
  ],
  [
    'What if my frame size doesn\'t match my appearance?',
    'Frame size is based on bone structure measurements, not appearance. Muscle mass, body fat, and other factors can make someone appear different from their frame size category.',
  ],
  [
    'How accurate is the frame size calculation?',
    'Frame size calculation provides a useful estimate based on height-to-wrist ratio. It\'s a general guideline and should be used alongside other body composition assessments.',
  ],
  [
    'Should I adjust my diet based on frame size?',
    'Frame size can inform calorie and macronutrient needs, as larger frames typically require more calories. However, individual factors like activity level and goals are more important for diet planning.',
  ],
];

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Measure your wrist circumference accurately and calculate your frame size to understand your body structure.' },
  { week: 2, focus: 'Review your ideal weight range based on frame size and set realistic body composition goals.' },
  { week: 3, focus: 'Adjust your training approach based on frame size: small frames focus on relative strength, large frames on absolute strength.' },
  { week: 4, focus: 'Optimize your nutrition to support your frame size and training goals—larger frames may need more calories.' },
  { week: 5, focus: 'Focus on progressive overload in your training, adjusting rep ranges based on your frame size recommendations.' },
  { week: 6, focus: 'Monitor your progress and adjust training volume and intensity based on how your body responds.' },
  { week: 7, focus: 'Reassess your frame size measurements to ensure consistency and track any changes in body composition.' },
  { week: 8, focus: 'Establish long-term habits that align with your frame size and support your health and fitness goals.' },
];

const warningSigns = () => [
  'Frame size is a general guideline and should not be used as the sole determinant of ideal weight or health status.',
  'Extreme frame size measurements may indicate measurement errors—ensure accurate wrist circumference measurement.',
  'Frame size does not account for muscle mass, body fat, or other body composition factors—use alongside other assessments.',
];

export default function FrameSizeCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      height: undefined,
      wristCircumference: undefined,
      gender: undefined,
      age: undefined,
      unitSystem: 'metric',
    },
  });

  const calculateFrameSize = (height: number, wristCircumference: number, gender: string, unitSystem: string) => {
    let h = height;
    let w = wristCircumference;

    // Convert to metric if needed
    if (unitSystem === 'imperial') {
      h = height * 2.54; // inches to cm
      w = wristCircumference * 2.54; // inches to cm
    }

    // Frame size calculation based on height and wrist circumference
    let frameIndex = 0;
    let frameSize = '';

    if (gender === 'male') {
      frameIndex = h / w;
      if (frameIndex > 10.4) {
        frameSize = 'Small';
      } else if (frameIndex > 9.6) {
        frameSize = 'Medium';
      } else {
        frameSize = 'Large';
      }
    } else {
      frameIndex = h / w;
      if (frameIndex > 11.0) {
        frameSize = 'Small';
      } else if (frameIndex > 10.1) {
        frameSize = 'Medium';
      } else {
        frameSize = 'Large';
      }
    }

    return {
      frameSize,
      frameIndex: Math.round(frameIndex * 100) / 100,
    };
  };

  const calculateIdealWeightRange = (height: number, frameSize: string, gender: string, unitSystem: string) => {
    let h = height;
    
    // Convert to metric if needed
    if (unitSystem === 'imperial') {
      h = height * 2.54; // inches to cm
    }

    const heightInMeters = h / 100;
    let baseWeight = 0;

    // Base weight calculation (BMI 22)
    baseWeight = 22 * (heightInMeters * heightInMeters);

    // Adjust for frame size
    let minMultiplier = 0.9;
    let maxMultiplier = 1.1;

    if (frameSize === 'Small') {
      minMultiplier = 0.85;
      maxMultiplier = 1.05;
    } else if (frameSize === 'Large') {
      minMultiplier = 0.95;
      maxMultiplier = 1.15;
    }

    const minWeight = baseWeight * minMultiplier;
    const maxWeight = baseWeight * maxMultiplier;

    // Convert back to original units if needed
    if (unitSystem === 'imperial') {
      return {
        min: Math.round(minWeight * 2.20462 * 10) / 10,
        max: Math.round(maxWeight * 2.20462 * 10) / 10,
      };
    }

    return {
      min: Math.round(minWeight * 10) / 10,
      max: Math.round(maxWeight * 10) / 10,
    };
  };

  const getFrameCharacteristics = (frameSize: string) => {
    const characteristics = {
      Small: [
        'Narrow shoulders and hips',
        'Thin wrists and ankles',
        'Light bone structure',
        'May appear delicate or slender',
        'Typically lower muscle mass potential',
        'May need to focus on strength training'
      ],
      Medium: [
        'Proportional shoulders and hips',
        'Moderate bone structure',
        'Balanced body proportions',
        'Good muscle mass potential',
        'Versatile for various activities',
        'Most common frame size'
      ],
      Large: [
        'Broad shoulders and hips',
        'Thick wrists and ankles',
        'Heavy bone structure',
        'May appear stocky or robust',
        'High muscle mass potential',
        'Natural strength advantages'
      ],
    };

    return characteristics[frameSize as keyof typeof characteristics] || [];
  };

  const onSubmit = (values: FormValues) => {
    const { frameSize, frameIndex } = calculateFrameSize(values.height, values.wristCircumference, values.gender, values.unitSystem);
    const idealWeightRange = calculateIdealWeightRange(values.height, frameSize, values.gender, values.unitSystem);
    const characteristics = getFrameCharacteristics(frameSize);

    let interpretation = '';
    let recommendations: string[] = [];

    if (frameSize === 'Small') {
      interpretation = 'You have a small frame, which means you have a lighter bone structure. This can be advantageous for endurance activities and may mean you need to focus more on strength training to build muscle mass.';
      recommendations = [
        'Focus on progressive strength training to build muscle mass',
        'Ensure adequate protein intake (1.6-2.2g per kg body weight)',
        'Consider higher rep ranges (8-15) for muscle hypertrophy',
        'Don\'t be discouraged by lower absolute strength numbers',
        'Focus on relative strength and bodyweight exercises'
      ];
    } else if (frameSize === 'Medium') {
      interpretation = 'You have a medium frame, which provides a good balance for most physical activities. You have moderate potential for both strength and endurance activities.';
      recommendations = [
        'Maintain a balanced approach to training',
        'Focus on both strength and cardiovascular fitness',
        'Use moderate rep ranges (6-12) for muscle building',
        'Consider a variety of training modalities',
        'Monitor your progress with multiple metrics'
      ];
    } else {
      interpretation = 'You have a large frame, which typically provides advantages in strength and power activities. You may have higher muscle mass potential and natural strength advantages.';
      recommendations = [
        'Focus on heavy compound movements for strength',
        'Use lower rep ranges (3-8) for maximum strength',
        'Take advantage of your natural strength potential',
        'Consider powerlifting or strength sports',
        'Ensure proper form to prevent injury with heavy weights'
      ];
    }

    setResult({
      frameSize,
      frameIndex,
      interpretation,
      idealWeightRange,
      recommendations,
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
          <CardTitle className="flex items-center gap-2"><Ruler className="h-5 w-5" /> Frame Size Calculator</CardTitle>
          <CardDescription>Determine your body frame size based on height and wrist circumference to assess ideal weight ranges and training approaches.</CardDescription>
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
              <Button type="submit" className="w-full md:w-auto">Calculate Frame Size</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Activity className="h-8 w-8 text-primary" /><CardTitle>Frame Size Analysis</CardTitle></div>
              <CardDescription>Your frame size assessment and ideal weight range</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded">
                  <p className="text-3xl font-bold text-primary">{result.frameSize}</p>
                  <p className="text-sm text-muted-foreground">Frame Size</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <p className="text-3xl font-bold text-primary">{result.frameIndex}</p>
                  <p className="text-sm text-muted-foreground">Frame Index</p>
                </div>
              </div>
              <div className="text-center p-4 border rounded">
                <p className="text-2xl font-bold text-primary">
                  {result.idealWeightRange.min} - {result.idealWeightRange.max} {unit === 'metric' ? 'kg' : 'lbs'}
                </p>
                <p className="text-sm text-muted-foreground">Ideal Weight Range</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Frame Characteristics</CardTitle>
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
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Frame Size Optimization Plan</CardTitle>
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
                <Link href="/category/health-fitness/ideal-body-weight-calculator" className="text-primary hover:underline">
                  Ideal Body Weight Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Determine ideal weight ranges to complement frame size assessment.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/bmi-calculator" className="text-primary hover:underline">
                  BMI Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Calculate body mass index alongside frame size measurements.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/body-fat-percentage-calculator" className="text-primary hover:underline">
                  Body Fat Percentage Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Assess body composition to complement frame size analysis.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/somatotype-calculator" className="text-primary hover:underline">
                  Somatotype Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Determine body type classification alongside frame size.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Guide: Understanding Frame Size</CardTitle>
          <CardDescription>Evidence-based information about frame size and its implications</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            Frame size refers to the relative size of your bone structure, determined by comparing your height to your wrist circumference. It helps assess ideal weight ranges, muscle mass potential, and training approaches that suit your body type.
          </p>
          <p>
            Frame size is calculated by dividing height by wrist circumference, with different thresholds for men and women. Small frames have narrow bones and lighter builds, medium frames have balanced proportions, and large frames have wide bones and heavier builds.
          </p>
          <p>
            Understanding your frame size can inform training approaches: small frames may benefit from relative strength and endurance training, medium frames can use a balanced approach, and large frames may excel in absolute strength and power training.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Common questions about frame size assessment</CardDescription>
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
