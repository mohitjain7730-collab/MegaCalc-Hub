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
import { Dumbbell } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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

export default function FatFreeMassIndexCalculator() {
  const [result, setResult] = useState<{
    ffmi: number;
    ffmiCategory: string;
    fatFreeMass: number;
    interpretation: string;
    recommendations: string[];
    naturalLimits: {
      natural: number;
      enhanced: number;
    };
    comparison: {
      average: number;
      percentile: string;
    };
  } | null>(null);

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
      naturalLimits,
      comparison: {
        average: averageFFMI,
        percentile,
      },
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
                      <SelectItem value="metric">Metric (cm, kg)</SelectItem>
                      <SelectItem value="imperial">Imperial (inches, lbs)</SelectItem>
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
              name="height" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height ({form.watch('unitSystem') === 'metric' ? 'cm' : 'inches'})</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1"
                      placeholder={`Enter height in ${form.watch('unitSystem') === 'metric' ? 'cm' : 'inches'}`}
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
              name="trainingExperience" 
              render={({ field }) => (
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
              )} 
            />
          </div>
          <Button type="submit">Calculate FFMI</Button>
        </form>
      </Form>

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

          <Card>
            <CardHeader>
              <CardTitle>Analysis & Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
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
              The Fat-Free Mass Index (FFMI) is calculated by dividing your fat-free mass (in kg) by your height 
              squared (in meters). It provides a standardized way to assess muscle mass relative to body size, 
              similar to how BMI assesses overall body mass.
            </p>
            <p>
              FFMI is particularly useful for athletes and bodybuilders as it helps assess muscle development 
              while accounting for body size, making it more accurate than absolute muscle mass measurements.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="guide">
          <AccordionTrigger>Complete Guide to Fat-Free Mass Index (FFMI)</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is FFMI?</h4>
              <p>
                The Fat-Free Mass Index (FFMI) is a measure of muscle mass relative to height, similar to BMI but 
                specifically for lean body mass. It's calculated as fat-free mass (kg) divided by height squared (m²). 
                FFMI is particularly valuable for athletes, bodybuilders, and fitness enthusiasts to assess muscle 
                development and potential.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">FFMI Categories</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Below Average:</strong> FFMI below 17 (males) / 14 (females)</li>
                <li><strong>Average:</strong> FFMI 17-19 (males) / 14-16 (females)</li>
                <li><strong>Good:</strong> FFMI 19-21 (males) / 16-18 (females)</li>
                <li><strong>Very Good:</strong> FFMI 21-23 (males) / 18-20 (females)</li>
                <li><strong>Excellent:</strong> FFMI 23-25 (males) / 20-22 (females)</li>
                <li><strong>Exceptional:</strong> FFMI above 25 (males) / 22 (females)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Natural Limits</h4>
              <p>
                Research suggests that natural FFMI limits are approximately 25 for men and 20 for women. 
                Values significantly above these limits may indicate enhanced performance or exceptional genetics. 
                These limits are based on studies of natural bodybuilders and athletes.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Factors Affecting FFMI</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Training Experience:</strong> More experienced lifters typically have higher FFMI</li>
                <li><strong>Genetics:</strong> Natural muscle-building potential varies significantly</li>
                <li><strong>Age:</strong> FFMI peaks in the 20s-30s and may decline with age</li>
                <li><strong>Training Program:</strong> Proper programming maximizes muscle development</li>
                <li><strong>Nutrition:</strong> Adequate protein and calories support muscle growth</li>
                <li><strong>Recovery:</strong> Sleep and stress management affect muscle development</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Improving Your FFMI</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Progressive Overload:</strong> Gradually increase training intensity and volume</li>
                <li><strong>Protein Intake:</strong> Consume 1.6-2.2g protein per kg body weight daily</li>
                <li><strong>Caloric Surplus:</strong> Eat slightly more calories than you burn for growth</li>
                <li><strong>Compound Movements:</strong> Focus on multi-joint exercises for maximum muscle activation</li>
                <li><strong>Recovery:</strong> Ensure adequate sleep (7-9 hours) and manage stress</li>
                <li><strong>Consistency:</strong> Maintain regular training and nutrition habits</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Limitations of FFMI</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Requires accurate body fat percentage measurement</li>
                <li>May not account for bone density and organ mass variations</li>
                <li>Natural limits are estimates based on limited research</li>
                <li>Doesn't distinguish between muscle quality and quantity</li>
                <li>May not be accurate for very tall or very short individuals</li>
                <li>Should be used alongside other body composition measures</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">FFMI vs Other Measures</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>vs BMI:</strong> FFMI focuses on muscle mass, BMI includes all body mass</li>
                <li><strong>vs Body Fat %:</strong> FFMI shows muscle development, body fat % shows leanness</li>
                <li><strong>vs Absolute Muscle Mass:</strong> FFMI accounts for body size differences</li>
                <li><strong>vs Strength:</strong> FFMI measures muscle size, not necessarily strength</li>
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
                  <li><a href="/category/health-fitness/muscle-mass-percentage-calculator" className="text-primary underline">Muscle Mass Percentage Calculator</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Fitness & Training</h4>
                <ul className="space-y-1">
                  <li><a href="/category/health-fitness/one-rep-max-strength-calculator" className="text-primary underline">One Rep Max Calculator</a></li>
                  <li><a href="/category/health-fitness/training-volume-calculator" className="text-primary underline">Training Volume Calculator</a></li>
                  <li><a href="/category/health-fitness/protein-intake-calculator" className="text-primary underline">Protein Intake Calculator</a></li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

