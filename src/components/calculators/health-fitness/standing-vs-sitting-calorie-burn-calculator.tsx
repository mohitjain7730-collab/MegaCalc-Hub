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
import { Users } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  weight: z.number().positive('Weight must be positive'),
  height: z.number().positive('Height must be positive'),
  age: z.number().positive('Age must be positive'),
  gender: z.enum(['male', 'female']),
  sittingHours: z.number().min(0, 'Hours cannot be negative').max(24, 'Hours cannot exceed 24'),
  standingHours: z.number().min(0, 'Hours cannot be negative').max(24, 'Hours cannot exceed 24'),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  standingType: z.enum(['static', 'fidgeting', 'walking_around', 'active_standing']),
});

type FormValues = z.infer<typeof formSchema>;

export default function StandingVsSittingCalorieBurnCalculator() {
  const [result, setResult] = useState<{
    sittingCalories: number;
    standingCalories: number;
    calorieDifference: number;
    percentageIncrease: number;
    interpretation: string;
    recommendations: string[];
    healthBenefits: string[];
    weeklyProjection: {
      sitting: number;
      standing: number;
      difference: number;
    };
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weight: undefined,
      height: undefined,
      age: undefined,
      gender: undefined,
      sittingHours: undefined,
      standingHours: undefined,
      activityLevel: undefined,
      standingType: undefined,
    },
  });

  const calculateBMR = (weight: number, height: number, age: number, gender: string) => {
    if (gender === 'male') {
      return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
  };

  const getActivityMultiplier = (activityLevel: string) => {
    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    return multipliers[activityLevel as keyof typeof multipliers];
  };

  const getStandingMultiplier = (standingType: string) => {
    const multipliers = {
      static: 1.1, // 10% increase over sitting
      fidgeting: 1.2, // 20% increase
      walking_around: 1.4, // 40% increase
      active_standing: 1.6, // 60% increase
    };
    return multipliers[standingType as keyof typeof multipliers];
  };

  const calculateCalories = (values: FormValues) => {
    const bmr = calculateBMR(values.weight, values.height, values.age, values.gender);
    const activityMultiplier = getActivityMultiplier(values.activityLevel);
    const standingMultiplier = getStandingMultiplier(values.standingType);
    
    // Base calories per hour (BMR adjusted for activity level)
    const baseCaloriesPerHour = (bmr * activityMultiplier) / 24;
    
    // Sitting calories (base rate)
    const sittingCalories = values.sittingHours * baseCaloriesPerHour;
    
    // Standing calories (with multiplier)
    const standingCalories = values.standingHours * baseCaloriesPerHour * standingMultiplier;
    
    return {
      sitting: Math.round(sittingCalories * 100) / 100,
      standing: Math.round(standingCalories * 100) / 100,
    };
  };

  const onSubmit = (values: FormValues) => {
    const { sitting, standing } = calculateCalories(values);
    const calorieDifference = standing - sitting;
    const percentageIncrease = sitting > 0 ? ((standing - sitting) / sitting) * 100 : 0;

    let interpretation = '';
    let recommendations: string[] = [];
    let healthBenefits: string[] = [];

    if (calorieDifference < 10) {
      interpretation = 'Your current standing time provides minimal calorie burn difference. Consider increasing standing time or adding more movement while standing.';
      recommendations = [
        'Aim for at least 2-3 hours of standing per day',
        'Try standing during phone calls or meetings',
        'Use a standing desk if possible',
        'Take standing breaks every 30-60 minutes'
      ];
    } else if (calorieDifference < 50) {
      interpretation = 'You\'re getting a moderate calorie burn benefit from standing. This is a good start for improving your daily activity level.';
      recommendations = [
        'Gradually increase standing time to 4-6 hours daily',
        'Add gentle movement while standing (shifting weight, light stretching)',
        'Consider alternating between sitting and standing',
        'Track your progress to stay motivated'
      ];
    } else {
      interpretation = 'Excellent! You\'re significantly increasing your calorie burn through standing. This level of activity provides substantial health benefits.';
      recommendations = [
        'Maintain this level of standing activity',
        'Consider adding light exercises while standing',
        'Share your success to motivate others',
        'Monitor for any discomfort and adjust as needed'
      ];
    }

    healthBenefits = [
      'Improved posture and reduced back pain',
      'Better blood circulation and reduced swelling',
      'Increased energy levels and alertness',
      'Reduced risk of obesity and metabolic syndrome',
      'Lower risk of cardiovascular disease',
      'Improved muscle tone and core strength',
      'Better blood sugar control',
      'Reduced risk of certain cancers'
    ];

    // Weekly projection
    const weeklyProjection = {
      sitting: Math.round(sitting * 7 * 100) / 100,
      standing: Math.round(standing * 7 * 100) / 100,
      difference: Math.round(calorieDifference * 7 * 100) / 100,
    };

    setResult({
      sittingCalories: sitting,
      standingCalories: standing,
      calorieDifference,
      percentageIncrease,
      interpretation,
      recommendations,
      healthBenefits,
      weeklyProjection,
    });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              name="sittingHours" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hours Spent Sitting</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter hours sitting"
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
              name="standingHours" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hours Spent Standing</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter hours standing"
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
                  <FormLabel>Overall Activity Level</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
                      <SelectItem value="light">Light (light exercise 1-3 days/week)</SelectItem>
                      <SelectItem value="moderate">Moderate (moderate exercise 3-5 days/week)</SelectItem>
                      <SelectItem value="active">Active (hard exercise 6-7 days/week)</SelectItem>
                      <SelectItem value="very_active">Very Active (very hard exercise, physical job)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <FormField 
              control={form.control} 
              name="standingType" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type of Standing</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select standing type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="static">Static Standing (minimal movement)</SelectItem>
                      <SelectItem value="fidgeting">Fidgeting (shifting weight, small movements)</SelectItem>
                      <SelectItem value="walking_around">Walking Around (moving between areas)</SelectItem>
                      <SelectItem value="active_standing">Active Standing (exercises, stretching)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} 
            />
          </div>
          <Button type="submit">Calculate Calorie Difference</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Users className="h-8 w-8 text-primary" />
                <CardTitle>Standing vs Sitting Calorie Burn</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-500">{result.sittingCalories}</p>
                  <p className="text-sm text-muted-foreground">Sitting Calories</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">{result.standingCalories}</p>
                  <p className="text-sm text-muted-foreground">Standing Calories</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">+{result.calorieDifference}</p>
                  <p className="text-sm text-muted-foreground">Extra Calories</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">+{result.percentageIncrease.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">Increase</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Projection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-500">{result.weeklyProjection.sitting}</p>
                  <p className="text-sm text-muted-foreground">Weekly Sitting Calories</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">{result.weeklyProjection.standing}</p>
                  <p className="text-sm text-muted-foreground">Weekly Standing Calories</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">+{result.weeklyProjection.difference}</p>
                  <p className="text-sm text-muted-foreground">Weekly Extra Calories</p>
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
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Recommendations:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {result.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Health Benefits of Standing:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {result.healthBenefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
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
              This calculator compares the calorie burn between sitting and standing by using your basal metabolic 
              rate (BMR) as a foundation and applying different activity multipliers. Standing typically burns 
              10-60% more calories than sitting, depending on the type of standing activity.
            </p>
            <p>
              The calculation considers your body composition, overall activity level, and the specific type of 
              standing you're doing to provide accurate calorie burn estimates for both positions.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="guide">
          <AccordionTrigger>Complete Guide to Standing vs Sitting</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">The Science Behind Standing</h4>
              <p>
                Research shows that standing burns more calories than sitting because it engages more muscle groups, 
                particularly in the legs, core, and back. The exact calorie difference depends on factors like 
                body weight, standing posture, and amount of movement while standing.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Calorie Burn Comparison</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Sitting:</strong> 1.0x BMR (baseline metabolic rate)</li>
                <li><strong>Static Standing:</strong> 1.1x BMR (10% increase)</li>
                <li><strong>Fidgeting While Standing:</strong> 1.2x BMR (20% increase)</li>
                <li><strong>Walking Around:</strong> 1.4x BMR (40% increase)</li>
                <li><strong>Active Standing:</strong> 1.6x BMR (60% increase)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Health Benefits of Standing</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Metabolic Benefits:</strong> Improved blood sugar control and insulin sensitivity</li>
                <li><strong>Cardiovascular Health:</strong> Better circulation and reduced heart disease risk</li>
                <li><strong>Musculoskeletal:</strong> Stronger core, improved posture, reduced back pain</li>
                <li><strong>Mental Health:</strong> Increased energy, better focus, and reduced fatigue</li>
                <li><strong>Long-term Health:</strong> Reduced risk of obesity, diabetes, and certain cancers</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Risks of Prolonged Sitting</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Increased risk of cardiovascular disease and diabetes</li>
                <li>Poor posture and back/neck pain</li>
                <li>Reduced muscle strength and flexibility</li>
                <li>Decreased bone density over time</li>
                <li>Impaired circulation and swelling in legs</li>
                <li>Reduced mental alertness and productivity</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Practical Tips for More Standing</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>At Work:</strong> Use a standing desk or adjustable workstation</li>
                <li><strong>Meetings:</strong> Conduct walking meetings or stand during presentations</li>
                <li><strong>Phone Calls:</strong> Stand and walk around during phone conversations</li>
                <li><strong>Breaks:</strong> Take standing breaks every 30-60 minutes</li>
                <li><strong>Transportation:</strong> Stand on public transport when possible</li>
                <li><strong>Home:</strong> Stand while watching TV or using devices</li>
                <li><strong>Errands:</strong> Choose stairs over elevators</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Finding the Right Balance</h4>
              <p>
                While standing has benefits, it's important to find the right balance. Prolonged standing can 
                also cause issues like foot pain, varicose veins, and fatigue. Aim for a mix of sitting, 
                standing, and movement throughout the day. The ideal ratio is often cited as 1:1 or 2:1 
                (sitting to standing), but listen to your body and adjust based on comfort and productivity.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Standing Desk Setup</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Monitor at eye level to prevent neck strain</li>
                <li>Keyboard and mouse at elbow height</li>
                <li>Use an anti-fatigue mat for comfort</li>
                <li>Wear supportive, comfortable shoes</li>
                <li>Start with 30-60 minutes and gradually increase</li>
                <li>Alternate between sitting and standing throughout the day</li>
              </ul>
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
                  <li><a href="/category/health-fitness/step-to-calorie-converter" className="text-primary underline">Step-to-Calorie Converter</a></li>
                  <li><a href="/category/health-fitness/daily-activity-points-calculator" className="text-primary underline">Daily Activity Points Calculator</a></li>
                  <li><a href="/category/health-fitness/calorie-burn-calculator" className="text-primary underline">Calorie Burn Calculator</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Health & Fitness</h4>
                <ul className="space-y-1">
                  <li><a href="/category/health-fitness/bmr-calculator" className="text-primary underline">BMR Calculator</a></li>
                  <li><a href="/category/health-fitness/body-fat-percentage-calculator" className="text-primary underline">Body Fat Percentage Calculator</a></li>
                  <li><a href="/category/health-fitness/posture-calculator" className="text-primary underline">Posture Assessment Calculator</a></li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
