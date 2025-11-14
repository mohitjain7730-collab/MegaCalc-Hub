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
import { Dumbbell, Activity, Calendar, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  height: z.number().positive('Height must be positive'),
  weight: z.number().positive('Weight must be positive'),
  bodyFatPercentage: z.number().min(0, 'Body fat percentage cannot be negative').max(50, 'Body fat percentage seems too high'),
  gender: z.enum(['male', 'female']),
  age: z.number().positive('Age must be positive'),
  trainingExperience: z.enum(['beginner', 'intermediate', 'advanced', 'elite']),
  unitSystem: z.enum(['metric', 'imperial']),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  ffmi: number;
  ffmiCategory: string;
  fatFreeMass: number;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  naturalLimits: {
    natural: number;
    enhanced: number;
  };
  comparison: {
    average: number;
    percentile: string;
  };
};

const understandingInputs = [
  {
    label: 'Height & Weight',
    description: 'Body measurements used to calculate FFMI. Height and weight are essential for determining body size and fat-free mass index.',
  },
  {
    label: 'Body Fat Percentage',
    description: 'Measured via DEXA, BIA, skinfold calipers, or other methods. Essential for calculating fat-free mass, which is used in FFMI calculation.',
  },
  {
    label: 'Gender',
    description: 'Men typically have higher FFMI than women due to hormonal and structural differences. Natural limits are ~25 for men and ~20 for women.',
  },
  {
    label: 'Age',
    description: 'FFMI may decline with age due to muscle loss (sarcopenia). Older adults may have lower FFMI even with regular training.',
  },
  {
    label: 'Training Experience',
    description: 'More experienced lifters typically have higher FFMI due to accumulated muscle development over years of training.',
  },
];

const faqs: [string, string][] = [
  [
    'What is Fat-Free Mass Index (FFMI)?',
    'FFMI is calculated by dividing fat-free mass (in kg) by height squared (in meters). It provides a standardized way to assess muscle mass relative to body size, similar to how BMI assesses overall body mass.',
  ],
  [
    'How is FFMI different from BMI?',
    'FFMI focuses specifically on muscle mass (fat-free mass), while BMI includes all body mass (muscle, fat, bone, organs). FFMI is more useful for athletes and bodybuilders to assess muscle development.',
  ],
  [
    'What is a good FFMI score?',
    'For men, average FFMI is ~19, with 23-25 being very good and 25+ approaching natural limits. For women, average FFMI is ~16, with 18-20 being very good and 20+ approaching natural limits.',
  ],
  [
    'What are natural FFMI limits?',
    'Research suggests natural FFMI limits are approximately 25 for men and 20 for women. Values significantly above these limits may indicate enhanced performance or exceptional genetics.',
  ],
  [
    'Can I increase my FFMI?',
    'Yes, through progressive resistance training, adequate protein intake (1.6-2.2g per kg), sufficient calories for growth, proper recovery, and consistency. FFMI increases as you build muscle mass.',
  ],
  [
    'How accurate is FFMI?',
    'FFMI requires accurate body fat percentage measurement. It provides a useful estimate but may not account for bone density and organ mass variations. Use alongside other body composition measures.',
  ],
  [
    'Does FFMI change with age?',
    'Yes. FFMI peaks in the 20s-30s and may decline with age due to muscle loss (sarcopenia). Regular strength training can slow or partially reverse this decline.',
  ],
  [
    'What is the difference between FFMI and muscle mass percentage?',
    'FFMI accounts for height (normalized to body size), while muscle mass percentage is the proportion of total body weight. FFMI is better for comparing individuals of different sizes.',
  ],
  [
    'Can women achieve high FFMI?',
    'Yes, though women typically have lower absolute FFMI than men due to hormonal differences. With proper training and nutrition, women can build substantial muscle and achieve high FFMI relative to their natural limits.',
  ],
  [
    'How often should I measure FFMI?',
    'Monthly measurements are sufficient. FFMI changes slowly as muscle mass develops. Focus on trends over weeks and months rather than day-to-day fluctuations.',
  ],
];

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Establish baseline: measure body fat percentage accurately (DEXA, BIA, or calipers) and calculate current FFMI.' },
  { week: 2, focus: 'Begin progressive resistance training 3-4 times per week, focusing on compound movements (squats, deadlifts, presses).' },
  { week: 3, focus: 'Optimize protein intake: aim for 1.6-2.2g per kg body weight daily, distributed across meals.' },
  { week: 4, focus: 'Ensure adequate caloric intake for muscle growth—slight surplus (200-500 calories) if not overweight.' },
  { week: 5, focus: 'Track training volume and intensity—aim for progressive overload each week (more weight, reps, or sets).' },
  { week: 6, focus: 'Prioritize recovery: 7-9 hours of sleep, stress management, and rest days between training sessions.' },
  { week: 7, focus: 'Reassess FFMI and adjust training/nutrition based on progress toward muscle development goals.' },
  { week: 8, focus: 'Establish long-term habits: maintain consistent training, nutrition, and recovery for sustained FFMI improvement.' },
];

const warningSigns = () => [
  'FFMI values significantly above natural limits (>25 for men, >20 for women) are rare and may indicate measurement errors, enhanced performance, or exceptional genetics.',
  'Very low FFMI (<17 for men, <14 for women) may indicate insufficient muscle mass or sarcopenia—consult a healthcare provider if concerned.',
  'Rapid changes in FFMI may indicate measurement errors or inconsistent body fat percentage measurements—ensure consistent measurement methods.',
];

export default function FatFreeMassIndexCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      height: undefined,
      weight: undefined,
      bodyFatPercentage: undefined,
      gender: undefined,
      age: undefined,
      trainingExperience: undefined,
      unitSystem: 'metric',
    },
  });

  const calculateFFMI = (height: number, weight: number, bodyFatPercentage: number, unitSystem: string) => {
    let h = height;
    let w = weight;

    // Convert to metric if needed
    if (unitSystem === 'imperial') {
      h = height * 2.54; // inches to cm
      w = weight * 0.453592; // pounds to kg
    }

    // Calculate fat-free mass
    const fatMass = (bodyFatPercentage / 100) * w;
    const fatFreeMass = w - fatMass;

    // Calculate FFMI: FFM (kg) / height (m)²
    const heightInMeters = h / 100;
    const ffmi = fatFreeMass / (heightInMeters * heightInMeters);

    return {
      ffmi: Math.round(ffmi * 100) / 100,
      fatFreeMass: Math.round(fatFreeMass * 100) / 100,
    };
  };

  const getFFMICategory = (ffmi: number, gender: string, trainingExperience: string) => {
    let naturalLimit = 0;
    let enhancedLimit = 0;

    if (gender === 'male') {
      naturalLimit = 25;
      enhancedLimit = 30;
    } else {
      naturalLimit = 20;
      enhancedLimit = 24;
    }

    if (ffmi > enhancedLimit) {
      return 'Exceptional (Enhanced)';
    } else if (ffmi > naturalLimit) {
      return 'Excellent (Near Natural Limit)';
    } else if (ffmi > naturalLimit - 2) {
      return 'Very Good';
    } else if (ffmi > naturalLimit - 4) {
      return 'Good';
    } else if (ffmi > naturalLimit - 6) {
      return 'Average';
    } else {
      return 'Below Average';
    }
  };

  const getFFMIInterpretation = (ffmi: number, gender: string, age: number, trainingExperience: string) => {
    let averageFFMI = 0;
    let naturalLimit = 0;

    if (gender === 'male') {
      averageFFMI = 19;
      naturalLimit = 25;
    } else {
      averageFFMI = 16;
      naturalLimit = 20;
    }

    const difference = ffmi - averageFFMI;
    const percentageOfNatural = (ffmi / naturalLimit) * 100;

    if (percentageOfNatural > 100) {
      return `Your FFMI exceeds natural limits, which may indicate enhanced performance or exceptional genetics. This level is rarely achieved naturally.`;
    } else if (percentageOfNatural > 90) {
      return `Excellent FFMI! You're approaching natural limits and have exceptional muscle development. This represents elite-level natural potential.`;
    } else if (percentageOfNatural > 80) {
      return `Very good FFMI! You have well-developed muscle mass and are in the upper range for natural development.`;
    } else if (percentageOfNatural > 70) {
      return `Good FFMI! You have solid muscle development with room for continued growth through proper training and nutrition.`;
    } else if (percentageOfNatural > 60) {
      return `Average FFMI. There's significant potential for muscle development through consistent training and proper nutrition.`;
    } else {
      return `Below average FFMI. Focus on progressive resistance training and adequate protein intake to build muscle mass.`;
    }
  };

  const getPercentile = (ffmi: number, gender: string) => {
    // Simplified percentile estimation
    let averageFFMI = 0;
    let stdDev = 0;

    if (gender === 'male') {
      averageFFMI = 19;
      stdDev = 2.5;
    } else {
      averageFFMI = 16;
      stdDev = 2.0;
    }

    const zScore = (ffmi - averageFFMI) / stdDev;
    
    if (zScore > 2) return '95th+ percentile';
    if (zScore > 1.5) return '90th-95th percentile';
    if (zScore > 1) return '80th-90th percentile';
    if (zScore > 0.5) return '60th-80th percentile';
    if (zScore > 0) return '50th-60th percentile';
    if (zScore > -0.5) return '40th-50th percentile';
    if (zScore > -1) return '20th-40th percentile';
    if (zScore > -1.5) return '10th-20th percentile';
    if (zScore > -2) return '5th-10th percentile';
    return 'Below 5th percentile';
  };

  const onSubmit = (values: FormValues) => {
    const { ffmi, fatFreeMass } = calculateFFMI(values.height, values.weight, values.bodyFatPercentage, values.unitSystem);
    const ffmiCategory = getFFMICategory(ffmi, values.gender, values.trainingExperience);
    const interpretation = getFFMIInterpretation(ffmi, values.gender, values.age, values.trainingExperience);
    const percentile = getPercentile(ffmi, values.gender);

    let recommendations: string[] = [];

    if (ffmi < 17) {
      recommendations = [
        'Focus on progressive resistance training 3-4 times per week',
        'Consume 1.6-2.2g protein per kg body weight daily',
        'Ensure adequate caloric surplus for muscle growth',
        'Prioritize compound movements (squats, deadlifts, presses)',
        'Get 7-9 hours of quality sleep for recovery'
      ];
    } else if (ffmi < 20) {
      recommendations = [
        'Continue progressive overload in your training',
        'Optimize protein timing around workouts',
        'Consider periodization in your training program',
        'Track your progress with measurements and photos',
        'Ensure proper recovery between training sessions'
      ];
    } else if (ffmi < 23) {
      recommendations = [
        'Fine-tune your training and nutrition for continued gains',
        'Consider advanced training techniques (drop sets, supersets)',
        'Optimize your training volume and frequency',
        'Focus on weak points and muscle imbalances',
        'Maintain consistency in your approach'
      ];
    } else {
      recommendations = [
        'Maintain your excellent muscle development',
        'Focus on strength and performance improvements',
        'Consider competing or setting new challenges',
        'Share your knowledge with others',
        'Continue monitoring for long-term health'
      ];
    }

    const naturalLimits = {
      natural: values.gender === 'male' ? 25 : 20,
      enhanced: values.gender === 'male' ? 30 : 24,
    };

    const averageFFMI = values.gender === 'male' ? 19 : 16;

    setResult({
      ffmi,
      ffmiCategory,
      fatFreeMass,
      interpretation,
      recommendations,
      warningSigns: warningSigns(),
      plan: plan(),
      naturalLimits,
      comparison: {
        average: averageFFMI,
        percentile,
      },
    });
  };

  const unit = form.watch('unitSystem');

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Dumbbell className="h-5 w-5" /> Fat-Free Mass Index (FFMI) Calculator</CardTitle>
          <CardDescription>Assess muscle mass relative to height to evaluate muscle development and natural potential more accurately than BMI alone.</CardDescription>
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
                <FormField control={form.control} name="trainingExperience" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Training Experience</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select training experience" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner (0-1 year)</SelectItem>
                        <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                        <SelectItem value="advanced">Advanced (3-5 years)</SelectItem>
                        <SelectItem value="elite">Elite (5+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate FFMI</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Dumbbell className="h-8 w-8 text-primary" />
                <CardTitle>Fat-Free Mass Index (FFMI) Results</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{result.ffmi}</p>
                  <p className="text-sm text-muted-foreground">FFMI Score</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{result.ffmiCategory}</p>
                  <p className="text-sm text-muted-foreground">Category</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{result.fatFreeMass} kg</p>
                  <p className="text-sm text-muted-foreground">Fat-Free Mass</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Natural Limits & Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">{result.naturalLimits.natural}</p>
                  <p className="text-sm text-muted-foreground">Natural Limit</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-500">{result.comparison.average}</p>
                  <p className="text-sm text-muted-foreground">Average FFMI</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{result.comparison.percentile}</p>
                  <p className="text-sm text-muted-foreground">Percentile Rank</p>
                </div>
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
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week FFMI Improvement Plan</CardTitle>
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
          <CardDescription>Collect accurate information for meaningful results</CardDescription>
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
              <p className="text-sm text-muted-foreground">Measure body fat percentage needed for FFMI calculation.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/lean-body-mass-calculator" className="text-primary hover:underline">
                  Lean Body Mass Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Calculate lean body mass to complement FFMI analysis.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/muscle-mass-percentage-calculator" className="text-primary hover:underline">
                  Muscle Mass Percentage Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Assess muscle mass percentage alongside FFMI measurements.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href="/category/health-fitness/protein-intake-calculator" className="text-primary hover:underline">
                  Protein Intake Calculator
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Determine optimal protein intake to support FFMI improvement.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Guide: Understanding Fat-Free Mass Index (FFMI)</CardTitle>
          <CardDescription>Evidence-based information about FFMI and muscle development</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            The Fat-Free Mass Index (FFMI) is a measure of muscle mass relative to height, similar to BMI but specifically for lean body mass. It's calculated as fat-free mass (kg) divided by height squared (m²). FFMI is particularly valuable for athletes, bodybuilders, and fitness enthusiasts to assess muscle development and potential.
          </p>
          <p>
            Research suggests that natural FFMI limits are approximately 25 for men and 20 for women. Values significantly above these limits may indicate enhanced performance or exceptional genetics. FFMI peaks in the 20s-30s and may decline with age due to muscle loss (sarcopenia). Regular strength training can slow or partially reverse this decline.
          </p>
          <p>
            To improve FFMI, focus on progressive resistance training, adequate protein intake (1.6-2.2g per kg), sufficient calories for growth, proper recovery, and consistency. FFMI requires accurate body fat percentage measurement and should be used alongside other body composition measures.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Common questions about Fat-Free Mass Index and muscle development</CardDescription>
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

