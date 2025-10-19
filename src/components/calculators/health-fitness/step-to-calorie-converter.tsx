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
import { Footprints } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  steps: z.number().positive('Steps must be positive'),
  weight: z.number().positive('Weight must be positive'),
  height: z.number().positive('Height must be positive'),
  age: z.number().positive('Age must be positive'),
  gender: z.enum(['male', 'female']),
  walkingSpeed: z.enum(['slow', 'moderate', 'brisk', 'fast']),
  terrain: z.enum(['flat', 'hilly', 'stairs', 'mixed']),
});

type FormValues = z.infer<typeof formSchema>;

export default function StepToCalorieConverter() {
  const [result, setResult] = useState<{
    caloriesBurned: number;
    distance: number;
    duration: number;
    pace: string;
    interpretation: string;
    recommendations: string[];
    dailyGoals: {
      steps: number;
      calories: number;
      distance: number;
    };
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      steps: undefined,
      weight: undefined,
      height: undefined,
      age: undefined,
      gender: undefined,
      walkingSpeed: undefined,
      terrain: undefined,
    },
  });

  const calculateCalories = (values: FormValues) => {
    // Base metabolic rate calculation (simplified)
    let bmr;
    if (values.gender === 'male') {
      bmr = 88.362 + (13.397 * values.weight) + (4.799 * values.height) - (5.677 * values.age);
    } else {
      bmr = 447.593 + (9.247 * values.weight) + (3.098 * values.height) - (4.330 * values.age);
    }

    // Calculate distance (average step length based on height)
    const stepLength = values.height * 0.43; // cm to step length ratio
    const distance = (values.steps * stepLength) / 100000; // Convert to km

    // Walking speed multipliers
    const speedMultipliers = {
      slow: 1.0,
      moderate: 1.2,
      brisk: 1.5,
      fast: 1.8,
    };

    // Terrain multipliers
    const terrainMultipliers = {
      flat: 1.0,
      hilly: 1.3,
      stairs: 1.6,
      mixed: 1.2,
    };

    // Calculate calories per step
    const baseCaloriesPerStep = (bmr / 24 / 60) * 0.05; // Base metabolic rate per minute * activity factor
    const speedMultiplier = speedMultipliers[values.walkingSpeed];
    const terrainMultiplier = terrainMultipliers[values.terrain];
    
    const caloriesPerStep = baseCaloriesPerStep * speedMultiplier * terrainMultiplier;
    const totalCalories = values.steps * caloriesPerStep;

    return {
      calories: Math.round(totalCalories * 100) / 100,
      distance: Math.round(distance * 100) / 100,
    };
  };

  const calculateDuration = (distance: number, speed: string) => {
    const speeds = {
      slow: 3, // km/h
      moderate: 4.5,
      brisk: 6,
      fast: 7.5,
    };
    
    const speedKmh = speeds[speed as keyof typeof speeds];
    const durationHours = distance / speedKmh;
    const durationMinutes = durationHours * 60;
    
    return Math.round(durationMinutes);
  };

  const getPace = (speed: string) => {
    const paces = {
      slow: '20+ min/km',
      moderate: '13-15 min/km',
      brisk: '10-12 min/km',
      fast: '8-10 min/km',
    };
    
    return paces[speed as keyof typeof paces];
  };

  const onSubmit = (values: FormValues) => {
    const { calories, distance } = calculateCalories(values);
    const duration = calculateDuration(distance, values.walkingSpeed);
    const pace = getPace(values.walkingSpeed);

    let interpretation = '';
    let recommendations: string[] = [];

    if (values.steps < 5000) {
      interpretation = 'Your step count is below the recommended daily minimum. Increasing your daily steps can significantly improve your health and fitness.';
      recommendations = [
        'Aim for at least 5,000 steps per day as a starting goal',
        'Take short walking breaks throughout the day',
        'Park farther away or take stairs when possible',
        'Consider a walking meeting or phone call'
      ];
    } else if (values.steps < 10000) {
      interpretation = 'You\'re making good progress with your daily steps! You\'re in the moderate activity range and burning a healthy amount of calories.';
      recommendations = [
        'Work toward the 10,000 steps per day goal',
        'Increase walking speed for more calorie burn',
        'Add variety with different terrains',
        'Track your progress to stay motivated'
      ];
    } else if (values.steps < 15000) {
      interpretation = 'Excellent! You\'re achieving the recommended daily step goal and burning substantial calories through walking.';
      recommendations = [
        'Maintain this level of activity',
        'Consider adding strength training',
        'Vary your walking routes for interest',
        'Share your success to motivate others'
      ];
    } else {
      interpretation = 'Outstanding! You\'re in the highly active range, burning significant calories and maintaining excellent cardiovascular health.';
      recommendations = [
        'You\'re exceeding recommendations - great job!',
        'Ensure you\'re getting adequate rest and recovery',
        'Consider cross-training to prevent overuse injuries',
        'Monitor for any signs of overtraining'
      ];
    }

    // Calculate daily goals
    const dailyGoals = {
      steps: 10000,
      calories: Math.round((calories / values.steps) * 10000),
      distance: Math.round((distance / values.steps) * 10000 * 100) / 100,
    };

    setResult({
      caloriesBurned: calories,
      distance,
      duration,
      pace,
      interpretation,
      recommendations,
      dailyGoals,
    });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField 
              control={form.control} 
              name="steps" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Steps</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter number of steps"
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
                  <FormLabel>Weight (kg)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter your weight"
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
              name="height" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height (cm)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter your height"
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
              name="walkingSpeed" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Walking Speed</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select walking speed" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="slow">Slow (3 km/h)</SelectItem>
                      <SelectItem value="moderate">Moderate (4.5 km/h)</SelectItem>
                      <SelectItem value="brisk">Brisk (6 km/h)</SelectItem>
                      <SelectItem value="fast">Fast (7.5 km/h)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <FormField 
              control={form.control} 
              name="terrain" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Terrain Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select terrain type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="flat">Flat (sidewalk, track)</SelectItem>
                      <SelectItem value="hilly">Hilly (rolling hills)</SelectItem>
                      <SelectItem value="stairs">Stairs (climbing)</SelectItem>
                      <SelectItem value="mixed">Mixed (various terrain)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} 
            />
          </div>
          <Button type="submit">Convert Steps to Calories</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Footprints className="h-8 w-8 text-primary" />
                <CardTitle>Step-to-Calorie Conversion</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{result.caloriesBurned}</p>
                  <p className="text-sm text-muted-foreground">Calories Burned</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{result.distance} km</p>
                  <p className="text-sm text-muted-foreground">Distance Walked</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{result.duration} min</p>
                  <p className="text-sm text-muted-foreground">Duration</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{result.pace}</p>
                  <p className="text-sm text-muted-foreground">Pace</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daily Goal Projection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{result.dailyGoals.steps.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Steps (10K goal)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{result.dailyGoals.calories}</p>
                  <p className="text-sm text-muted-foreground">Calories at 10K steps</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{result.dailyGoals.distance} km</p>
                  <p className="text-sm text-muted-foreground">Distance at 10K steps</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Analysis</CardTitle>
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
              This calculator converts your steps into calories burned by considering your body composition, 
              walking speed, and terrain type. It uses your basal metabolic rate (BMR) as a foundation and 
              applies activity multipliers based on the intensity and type of walking you're doing.
            </p>
            <p>
              The calculation accounts for the fact that heavier individuals burn more calories per step, 
              and different walking speeds and terrains require varying amounts of energy expenditure.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="guide">
          <AccordionTrigger>Complete Guide to Step Counting and Calorie Burn</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Understanding Step Counting</h4>
              <p>
                Step counting is one of the most accessible ways to track physical activity. The popular 
                10,000 steps per day goal originated from a Japanese pedometer marketing campaign in the 1960s, 
                but research has shown it's a reasonable target for general health benefits.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Factors Affecting Calorie Burn</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Body Weight:</strong> Heavier individuals burn more calories per step</li>
                <li><strong>Walking Speed:</strong> Faster walking increases calorie burn significantly</li>
                <li><strong>Terrain:</strong> Hills and stairs require more energy than flat surfaces</li>
                <li><strong>Age & Gender:</strong> Metabolic rate varies with age and biological sex</li>
                <li><strong>Fitness Level:</strong> More fit individuals may burn fewer calories for the same activity</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Step Count Guidelines</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Sedentary:</strong> Less than 5,000 steps per day</li>
                <li><strong>Low Active:</strong> 5,000-7,499 steps per day</li>
                <li><strong>Somewhat Active:</strong> 7,500-9,999 steps per day</li>
                <li><strong>Active:</strong> 10,000-12,499 steps per day</li>
                <li><strong>Highly Active:</strong> 12,500+ steps per day</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Health Benefits of Walking</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Improved cardiovascular health and reduced heart disease risk</li>
                <li>Better blood sugar control and reduced diabetes risk</li>
                <li>Enhanced mental health and reduced stress levels</li>
                <li>Stronger bones and reduced osteoporosis risk</li>
                <li>Better sleep quality and immune function</li>
                <li>Weight management and body composition improvement</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Tips for Increasing Daily Steps</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Take the stairs instead of elevators</li>
                <li>Park farther away from your destination</li>
                <li>Take walking breaks during work</li>
                <li>Walk while talking on the phone</li>
                <li>Get off public transportation one stop early</li>
                <li>Take a walk after meals</li>
                <li>Use a pedometer or fitness tracker for motivation</li>
                <li>Set daily and weekly step goals</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Accuracy Considerations</h4>
              <p>
                While step counters and calorie estimates provide useful guidance, they're not 100% accurate. 
                Factors like stride length variations, device placement, and individual metabolic differences 
                can affect measurements. Use these numbers as general guidelines rather than precise measurements.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related-calculators">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Activity Tracking</h4>
                <ul className="space-y-1">
                  <li><a href="/category/health-fitness/calorie-burn-calculator" className="text-primary underline">Calorie Burn Calculator</a></li>
                  <li><a href="/category/health-fitness/daily-activity-points-calculator" className="text-primary underline">Daily Activity Points Calculator</a></li>
                  <li><a href="/category/health-fitness/standing-vs-sitting-calorie-burn-calculator" className="text-primary underline">Standing vs Sitting Calculator</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Fitness & Health</h4>
                <ul className="space-y-1">
                  <li><a href="/category/health-fitness/bmr-calculator" className="text-primary underline">BMR Calculator</a></li>
                  <li><a href="/category/health-fitness/ideal-weight-calculator" className="text-primary underline">Ideal Weight Calculator</a></li>
                  <li><a href="/category/health-fitness/body-fat-percentage-calculator" className="text-primary underline">Body Fat Percentage Calculator</a></li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
