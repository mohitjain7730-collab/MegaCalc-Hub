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
import { Zap } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  weight: z.number().positive('Weight must be positive'),
  bodyFatPercentage: z.number().min(0, 'Body fat percentage cannot be negative').max(50, 'Body fat percentage seems too high'),
  gender: z.enum(['male', 'female']),
  age: z.number().positive('Age must be positive'),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  unitSystem: z.enum(['metric', 'imperial']),
});

type FormValues = z.infer<typeof formSchema>;

export default function MuscleMassPercentageCalculator() {
  const [result, setResult] = useState<{
    muscleMassPercentage: number;
    muscleMass: number;
    interpretation: string;
    recommendations: string[];
    comparison: {
      average: number;
      percentile: string;
    };
    muscleMassCategory: string;
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weight: undefined,
      bodyFatPercentage: undefined,
      gender: undefined,
      age: undefined,
      activityLevel: undefined,
      unitSystem: 'metric',
    },
  });

  const calculateMuscleMass = (values: FormValues) => {
    let w = values.weight;

    // Convert to metric if needed
    if (values.unitSystem === 'imperial') {
      w = values.weight * 0.453592; // pounds to kg
    }

    // Calculate fat mass
    const fatMass = (values.bodyFatPercentage / 100) * w;
    
    // Calculate lean body mass (includes muscle, bone, organs, water)
    const leanBodyMass = w - fatMass;
    
    // Estimate muscle mass (typically 40-50% of lean body mass)
    const muscleMassPercentage = (leanBodyMass * 0.45) / w * 100;
    const muscleMass = leanBodyMass * 0.45;

    return {
      muscleMassPercentage: Math.round(muscleMassPercentage * 100) / 100,
      muscleMass: Math.round(muscleMass * 100) / 100,
    };
  };

  const getMuscleMassCategory = (muscleMassPercentage: number, gender: string, age: number) => {
    let average = 0;
    let excellent = 0;

    if (gender === 'male') {
      average = 40;
      excellent = 45;
    } else {
      average = 35;
      excellent = 40;
    }

    // Adjust for age (muscle mass decreases with age)
    if (age > 50) {
      average -= 2;
      excellent -= 2;
    }

    if (muscleMassPercentage >= excellent) {
      return 'Excellent';
    } else if (muscleMassPercentage >= average + 2) {
      return 'Very Good';
    } else if (muscleMassPercentage >= average) {
      return 'Good';
    } else if (muscleMassPercentage >= average - 3) {
      return 'Average';
    } else {
      return 'Below Average';
    }
  };

  const getInterpretation = (muscleMassPercentage: number, gender: string, age: number, activityLevel: string) => {
    let average = gender === 'male' ? 40 : 35;
    
    // Adjust for age
    if (age > 50) average -= 2;

    const difference = muscleMassPercentage - average;

    if (difference > 5) {
      return `Excellent muscle mass! You have significantly above-average muscle development, which indicates excellent training and nutrition habits.`;
    } else if (difference > 2) {
      return `Very good muscle mass! You're above average and have solid muscle development. Continue your current approach.`;
    } else if (difference > -2) {
      return `Good muscle mass! You're in the average to above-average range. There's room for improvement with focused training.`;
    } else if (difference > -5) {
      return `Below average muscle mass. Focus on progressive resistance training and adequate protein intake to build muscle.`;
    } else {
      return `Significantly below average muscle mass. Prioritize strength training, proper nutrition, and consider consulting a fitness professional.`;
    }
  };

  const getPercentile = (muscleMassPercentage: number, gender: string) => {
    let average = gender === 'male' ? 40 : 35;
    let stdDev = gender === 'male' ? 4 : 3.5;

    const zScore = (muscleMassPercentage - average) / stdDev;
    
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
    const { muscleMassPercentage, muscleMass } = calculateMuscleMass(values);
    const muscleMassCategory = getMuscleMassCategory(muscleMassPercentage, values.gender, values.age);
    const interpretation = getInterpretation(muscleMassPercentage, values.gender, values.age, values.activityLevel);
    const percentile = getPercentile(muscleMassPercentage, values.gender);

    let recommendations: string[] = [];

    if (muscleMassPercentage < 35) {
      recommendations = [
        'Start with progressive resistance training 3-4 times per week',
        'Consume 1.6-2.2g protein per kg body weight daily',
        'Focus on compound movements (squats, deadlifts, presses)',
        'Ensure adequate caloric intake for muscle growth',
        'Get 7-9 hours of quality sleep for recovery'
      ];
    } else if (muscleMassPercentage < 40) {
      recommendations = [
        'Continue progressive overload in your training',
        'Optimize protein timing around workouts',
        'Consider increasing training volume gradually',
        'Track your progress with measurements and photos',
        'Ensure proper recovery between sessions'
      ];
    } else if (muscleMassPercentage < 45) {
      recommendations = [
        'Fine-tune your training and nutrition for continued gains',
        'Consider advanced training techniques',
        'Focus on weak points and muscle imbalances',
        'Maintain consistency in your approach',
        'Consider periodization in your training'
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

    const average = values.gender === 'male' ? 40 : 35;

    setResult({
      muscleMassPercentage,
      muscleMass,
      interpretation,
      recommendations,
      comparison: {
        average,
        percentile,
      },
      muscleMassCategory,
    });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField 
              control={form.control} 
              name="unitSystem" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit System</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit system" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="metric">Metric (kg)</SelectItem>
                      <SelectItem value="imperial">Imperial (lbs)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <FormField 
              control={form.control} 
              name="gender" 
              render={({ field }) => (
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
              )} 
            />
            <FormField 
              control={form.control} 
              name="weight" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight ({form.watch('unitSystem') === 'metric' ? 'kg' : 'lbs'})</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1"
                      placeholder={`Enter weight in ${form.watch('unitSystem') === 'metric' ? 'kg' : 'lbs'}`}
                      {...field} 
                      value={field.value ?? ''} 
                      onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <FormField 
              control={form.control} 
              name="bodyFatPercentage" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Body Fat Percentage (%)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1"
                      placeholder="Enter body fat percentage"
                      {...field} 
                      value={field.value ?? ''} 
                      onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <FormField 
              control={form.control} 
              name="age" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age (years)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter your age"
                      {...field} 
                      value={field.value ?? ''} 
                      onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <FormField 
              control={form.control} 
              name="activityLevel" 
              render={({ field }) => (
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
              )} 
            />
          </div>
          <Button type="submit">Calculate Muscle Mass Percentage</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Muscle Mass Percentage Results</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{result.muscleMassPercentage}%</p>
                  <p className="text-sm text-muted-foreground">Muscle Mass Percentage</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{result.muscleMass} kg</p>
                  <p className="text-sm text-muted-foreground">Total Muscle Mass</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{result.muscleMassCategory}</p>
                  <p className="text-sm text-muted-foreground">Category</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comparison & Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-500">{result.comparison.average}%</p>
                  <p className="text-sm text-muted-foreground">Average for Your Gender</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{result.comparison.percentile}</p>
                  <p className="text-sm text-muted-foreground">Percentile Rank</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">{result.interpretation}</p>
              <div>
                <h4 className="font-semibold mb-2">Recommendations:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {result.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>
              Muscle mass percentage is calculated by estimating muscle mass from your lean body mass and 
              expressing it as a percentage of your total body weight. This provides insight into your 
              muscle development relative to your overall body composition.
            </p>
            <p>
              The calculation uses your body fat percentage to determine lean body mass, then estimates 
              muscle mass as approximately 45% of lean body mass, which is typical for most individuals.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="guide">
          <AccordionTrigger>Complete Guide to Muscle Mass Percentage</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is Muscle Mass Percentage?</h4>
              <p>
                Muscle mass percentage represents the proportion of your total body weight that is composed 
                of muscle tissue. It's a key indicator of physical fitness, strength potential, and overall 
                health. Higher muscle mass percentage is associated with better metabolic health, strength, 
                and functional capacity.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Normal Muscle Mass Ranges</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Adult Males:</strong> 35-45% (average ~40%)</li>
                <li><strong>Adult Females:</strong> 30-40% (average ~35%)</li>
                <li><strong>Athletes:</strong> Often 5-10% higher than average</li>
                <li><strong>Elderly:</strong> May be 5-10% lower due to age-related muscle loss</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Factors Affecting Muscle Mass</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Training:</strong> Resistance training is the primary stimulus for muscle growth</li>
                <li><strong>Nutrition:</strong> Adequate protein and calories support muscle development</li>
                <li><strong>Age:</strong> Muscle mass peaks in the 20s-30s and declines with age</li>
                <li><strong>Genetics:</strong> Natural muscle-building potential varies significantly</li>
                <li><strong>Hormones:</strong> Testosterone, growth hormone, and insulin affect muscle growth</li>
                <li><strong>Recovery:</strong> Sleep and stress management impact muscle development</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Benefits of Higher Muscle Mass</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Improved metabolic rate and fat burning</li>
                <li>Better insulin sensitivity and blood sugar control</li>
                <li>Increased strength and functional capacity</li>
                <li>Better bone density and joint health</li>
                <li>Improved body composition and appearance</li>
                <li>Reduced risk of chronic diseases</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related-calculators">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Body Composition</h4>
                <ul className="space-y-1">
                  <li><a href="/category/health-fitness/body-fat-percentage-calculator" className="text-primary underline">Body Fat Percentage Calculator</a></li>
                  <li><a href="/category/health-fitness/lean-body-mass-calculator" className="text-primary underline">Lean Body Mass Calculator</a></li>
                  <li><a href="/category/health-fitness/fat-free-mass-index-calculator" className="text-primary underline">Fat-Free Mass Index Calculator</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Fitness & Training</h4>
                <ul className="space-y-1">
                  <li><a href="/category/health-fitness/protein-intake-calculator" className="text-primary underline">Protein Intake Calculator</a></li>
                  <li><a href="/category/health-fitness/training-volume-calculator" className="text-primary underline">Training Volume Calculator</a></li>
                  <li><a href="/category/health-fitness/one-rep-max-strength-calculator" className="text-primary underline">One Rep Max Calculator</a></li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}













