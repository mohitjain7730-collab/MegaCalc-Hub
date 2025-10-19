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
import { Monitor } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  age: z.number().positive('Age must be positive'),
  dailyScreenTime: z.number().min(0, 'Screen time cannot be negative').max(24, 'Screen time cannot exceed 24 hours'),
  sleepHours: z.number().min(0, 'Sleep hours cannot be negative').max(24, 'Sleep hours cannot exceed 24 hours'),
  screenTimeBeforeBed: z.number().min(0, 'Screen time before bed cannot be negative').max(8, 'Screen time before bed cannot exceed 8 hours'),
  deviceType: z.enum(['phone', 'tablet', 'computer', 'tv', 'mixed']),
  blueLightFilter: z.enum(['none', 'basic', 'advanced']),
  sleepQuality: z.enum(['poor', 'fair', 'good', 'excellent']),
  eyeStrain: z.enum(['none', 'mild', 'moderate', 'severe']),
  physicalActivity: z.number().min(0, 'Physical activity cannot be negative').max(8, 'Physical activity cannot exceed 8 hours'),
});

type FormValues = z.infer<typeof formSchema>;

export default function ScreenTimeVsSleepImpactCalculator() {
  const [result, setResult] = useState<{
    sleepImpactScore: number;
    screenTimeRisk: string;
    sleepQualityScore: number;
    recommendations: string[];
    healthRisks: string[];
    weeklyProjection: {
      sleepDebt: number;
      screenTimeHours: number;
      recommendedScreenTime: number;
    };
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      dailyScreenTime: undefined,
      sleepHours: undefined,
      screenTimeBeforeBed: undefined,
      deviceType: undefined,
      blueLightFilter: undefined,
      sleepQuality: undefined,
      eyeStrain: undefined,
      physicalActivity: undefined,
    },
  });

  const calculateSleepImpact = (values: FormValues) => {
    let impactScore = 0;
    
    // Age factor (younger people more affected by screen time)
    if (values.age < 18) impactScore += 20;
    else if (values.age < 30) impactScore += 15;
    else if (values.age < 50) impactScore += 10;
    else impactScore += 5;

    // Daily screen time impact
    if (values.dailyScreenTime > 8) impactScore += 25;
    else if (values.dailyScreenTime > 6) impactScore += 20;
    else if (values.dailyScreenTime > 4) impactScore += 15;
    else if (values.dailyScreenTime > 2) impactScore += 10;
    else impactScore += 5;

    // Screen time before bed impact
    if (values.screenTimeBeforeBed > 2) impactScore += 20;
    else if (values.screenTimeBeforeBed > 1) impactScore += 15;
    else if (values.screenTimeBeforeBed > 0.5) impactScore += 10;
    else impactScore += 5;

    // Device type impact
    const deviceImpact = {
      phone: 15,
      tablet: 12,
      computer: 10,
      tv: 8,
      mixed: 18,
    };
    impactScore += deviceImpact[values.deviceType];

    // Blue light filter impact
    const filterImpact = {
      none: 15,
      basic: 8,
      advanced: 3,
    };
    impactScore -= filterImpact[values.blueLightFilter];

    // Sleep quality impact
    const sleepQualityImpact = {
      poor: 20,
      fair: 15,
      good: 8,
      excellent: 3,
    };
    impactScore += sleepQualityImpact[values.sleepQuality];

    // Eye strain impact
    const eyeStrainImpact = {
      none: 0,
      mild: 5,
      moderate: 10,
      severe: 15,
    };
    impactScore += eyeStrainImpact[values.eyeStrain];

    // Physical activity benefit
    impactScore -= Math.min(values.physicalActivity * 2, 10);

    return Math.max(0, Math.min(100, impactScore));
  };

  const getScreenTimeRisk = (impactScore: number) => {
    if (impactScore >= 70) return 'High Risk';
    if (impactScore >= 50) return 'Moderate Risk';
    if (impactScore >= 30) return 'Low Risk';
    return 'Minimal Risk';
  };

  const calculateSleepQualityScore = (values: FormValues) => {
    let score = 100;
    
    // Sleep hours impact
    if (values.sleepHours < 6) score -= 30;
    else if (values.sleepHours < 7) score -= 20;
    else if (values.sleepHours > 9) score -= 15;
    else if (values.sleepHours >= 7 && values.sleepHours <= 9) score += 0;

    // Screen time before bed impact
    score -= values.screenTimeBeforeBed * 8;

    // Blue light filter benefit
    const filterBenefit = {
      none: 0,
      basic: 10,
      advanced: 20,
    };
    score += filterBenefit[values.blueLightFilter];

    return Math.max(0, Math.min(100, score));
  };

  const onSubmit = (values: FormValues) => {
    const sleepImpactScore = calculateSleepImpact(values);
    const screenTimeRisk = getScreenTimeRisk(sleepImpactScore);
    const sleepQualityScore = calculateSleepQualityScore(values);

    let recommendations: string[] = [];
    let healthRisks: string[] = [];

    if (sleepImpactScore >= 70) {
      recommendations = [
        'Reduce daily screen time to under 4 hours',
        'Implement a 2-hour screen-free period before bedtime',
        'Use advanced blue light filters on all devices',
        'Increase physical activity to at least 1 hour daily',
        'Consider digital detox weekends'
      ];
      healthRisks = [
        'Increased risk of insomnia and sleep disorders',
        'Higher likelihood of eye strain and digital eye syndrome',
        'Potential impact on mental health and mood',
        'Reduced cognitive performance and focus',
        'Increased risk of obesity and metabolic issues'
      ];
    } else if (sleepImpactScore >= 50) {
      recommendations = [
        'Limit screen time to 6 hours or less daily',
        'Create a 1-hour screen-free buffer before bed',
        'Use blue light filters on all devices',
        'Increase physical activity to 30-45 minutes daily',
        'Practice good sleep hygiene'
      ];
      healthRisks = [
        'Moderate risk of sleep quality issues',
        'Potential eye strain and fatigue',
        'Possible impact on mood and energy levels',
        'Risk of developing unhealthy screen habits'
      ];
    } else if (sleepImpactScore >= 30) {
      recommendations = [
        'Maintain current screen time levels',
        'Continue using blue light filters',
        'Keep 30-minute screen-free period before bed',
        'Maintain regular physical activity',
        'Monitor sleep quality regularly'
      ];
      healthRisks = [
        'Low risk of sleep-related issues',
        'Minimal impact on overall health'
      ];
    } else {
      recommendations = [
        'Excellent screen time and sleep balance',
        'Continue current healthy habits',
        'Share your strategies with others',
        'Maintain regular sleep schedule'
      ];
      healthRisks = [
        'Minimal health risks from screen time',
        'Good sleep quality and overall health'
      ];
    }

    // Weekly projection
    const weeklyProjection = {
      sleepDebt: Math.max(0, (7 - values.sleepHours) * 7),
      screenTimeHours: values.dailyScreenTime * 7,
      recommendedScreenTime: Math.min(6, values.dailyScreenTime * 0.8),
    };

    setResult({
      sleepImpactScore,
      screenTimeRisk,
      sleepQualityScore,
      recommendations,
      healthRisks,
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
              name="dailyScreenTime" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Daily Screen Time (hours)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.5"
                      placeholder="Enter daily screen time"
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
              name="sleepHours" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sleep Hours per Night</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.5"
                      placeholder="Enter sleep hours"
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
              name="screenTimeBeforeBed" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Screen Time Before Bed (hours)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.5"
                      placeholder="Enter screen time before bed"
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
              name="deviceType" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Device Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select device type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="tablet">Tablet</SelectItem>
                      <SelectItem value="computer">Computer</SelectItem>
                      <SelectItem value="tv">TV</SelectItem>
                      <SelectItem value="mixed">Mixed Devices</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <FormField 
              control={form.control} 
              name="blueLightFilter" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Blue Light Filter Usage</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select filter usage" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="basic">Basic (built-in)</SelectItem>
                      <SelectItem value="advanced">Advanced (third-party)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <FormField 
              control={form.control} 
              name="sleepQuality" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sleep Quality</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sleep quality" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="poor">Poor (fragmented, restless)</SelectItem>
                      <SelectItem value="fair">Fair (some interruptions)</SelectItem>
                      <SelectItem value="good">Good (mostly uninterrupted)</SelectItem>
                      <SelectItem value="excellent">Excellent (deep, restorative)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <FormField 
              control={form.control} 
              name="eyeStrain" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Eye Strain Level</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select eye strain level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="mild">Mild (occasional discomfort)</SelectItem>
                      <SelectItem value="moderate">Moderate (frequent discomfort)</SelectItem>
                      <SelectItem value="severe">Severe (constant discomfort)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <FormField 
              control={form.control} 
              name="physicalActivity" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Daily Physical Activity (hours)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.5"
                      placeholder="Enter physical activity hours"
                      {...field} 
                      value={field.value ?? ''} 
                      onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
          </div>
          <Button type="submit">Calculate Screen Time Impact</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Monitor className="h-8 w-8 text-primary" />
                <CardTitle>Screen Time vs Sleep Impact Analysis</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{result.sleepImpactScore}/100</p>
                  <p className="text-sm text-muted-foreground">Sleep Impact Score</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{result.screenTimeRisk}</p>
                  <p className="text-sm text-muted-foreground">Screen Time Risk Level</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{result.sleepQualityScore}/100</p>
                  <p className="text-sm text-muted-foreground">Sleep Quality Score</p>
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
                  <p className="text-2xl font-bold text-red-500">{result.weeklyProjection.sleepDebt}h</p>
                  <p className="text-sm text-muted-foreground">Weekly Sleep Debt</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-500">{result.weeklyProjection.screenTimeHours}h</p>
                  <p className="text-sm text-muted-foreground">Weekly Screen Time</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">{result.weeklyProjection.recommendedScreenTime}h</p>
                  <p className="text-sm text-muted-foreground">Recommended Daily Screen Time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analysis & Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
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
                  <h4 className="font-semibold mb-2">Health Risks:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {result.healthRisks.map((risk, index) => (
                      <li key={index}>{risk}</li>
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
              This calculator analyzes the relationship between your screen time habits and sleep quality by considering 
              multiple factors including device usage patterns, blue light exposure, sleep duration, and physical activity levels.
            </p>
            <p>
              The algorithm weighs various risk factors to provide a comprehensive assessment of how your digital habits 
              may be impacting your sleep and overall health.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="guide">
          <AccordionTrigger>Complete Guide to Screen Time and Sleep Health</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Understanding Screen Time Impact on Sleep</h4>
              <p>
                Excessive screen time, especially before bedtime, can significantly disrupt your sleep patterns. 
                Blue light from screens suppresses melatonin production, making it harder to fall asleep and stay asleep. 
                The content we consume can also increase mental stimulation and stress levels.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Blue Light and Circadian Rhythm</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Melatonin Suppression:</strong> Blue light blocks melatonin production for up to 2 hours</li>
                <li><strong>Circadian Disruption:</strong> Irregular screen exposure can shift your internal clock</li>
                <li><strong>Sleep Onset Delay:</strong> Screen use before bed can delay sleep by 30-60 minutes</li>
                <li><strong>REM Sleep Reduction:</strong> Late-night screen use reduces restorative REM sleep</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Health Risks of Excessive Screen Time</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Sleep Disorders:</strong> Insomnia, sleep apnea, and circadian rhythm disorders</li>
                <li><strong>Eye Health:</strong> Digital eye strain, dry eyes, and potential long-term vision issues</li>
                <li><strong>Mental Health:</strong> Increased anxiety, depression, and stress levels</li>
                <li><strong>Physical Health:</strong> Sedentary behavior, poor posture, and metabolic issues</li>
                <li><strong>Cognitive Function:</strong> Reduced attention span, memory problems, and decision-making</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Optimal Screen Time Guidelines</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Adults:</strong> 6-8 hours maximum daily, with 2-hour breaks every 2 hours</li>
                <li><strong>Teens:</strong> 4-6 hours daily, with emphasis on educational content</li>
                <li><strong>Children (6-12):</strong> 2-4 hours daily, with parental supervision</li>
                <li><strong>Before Bed:</strong> 1-2 hours screen-free period for optimal sleep</li>
                <li><strong>Morning:</strong> Avoid screens for first 30-60 minutes after waking</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Blue Light Protection Strategies</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Blue Light Filters:</strong> Use built-in or third-party apps like f.lux or Night Shift</li>
                <li><strong>Blue Light Glasses:</strong> Wear computer glasses with blue light blocking lenses</li>
                <li><strong>Screen Settings:</strong> Reduce brightness and use warm color temperatures</li>
                <li><strong>Distance:</strong> Maintain 20-26 inches distance from screens</li>
                <li><strong>20-20-20 Rule:</strong> Every 20 minutes, look at something 20 feet away for 20 seconds</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Digital Wellness Tips</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Screen-Free Zones:</strong> Keep bedrooms, dining areas, and bathrooms screen-free</li>
                <li><strong>Digital Curfews:</strong> Set specific times to stop using devices</li>
                <li><strong>Mindful Usage:</strong> Be intentional about why you're using screens</li>
                <li><strong>Alternative Activities:</strong> Replace screen time with reading, exercise, or hobbies</li>
                <li><strong>Family Time:</strong> Create screen-free family activities and conversations</li>
                <li><strong>Sleep Routine:</strong> Establish a consistent bedtime routine without screens</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Signs You Need to Reduce Screen Time</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Difficulty falling asleep or staying asleep</li>
                <li>Frequent eye strain, headaches, or dry eyes</li>
                <li>Increased anxiety or mood changes</li>
                <li>Reduced physical activity and social interaction</li>
                <li>Poor posture and neck/back pain</li>
                <li>Difficulty concentrating or remembering things</li>
                <li>Feeling restless or irritable when not using devices</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related-calculators">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Sleep & Wellness</h4>
                <ul className="space-y-1">
                  <li><a href="/category/health-fitness/sleep-quality-calculator" className="text-primary underline">Sleep Quality Calculator</a></li>
                  <li><a href="/category/health-fitness/sleep-debt-calculator" className="text-primary underline">Sleep Debt Calculator</a></li>
                  <li><a href="/category/health-fitness/circadian-rhythm-calculator" className="text-primary underline">Circadian Rhythm Calculator</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Health & Fitness</h4>
                <ul className="space-y-1">
                  <li><a href="/category/health-fitness/eye-strain-calculator" className="text-primary underline">Eye Strain Calculator</a></li>
                  <li><a href="/category/health-fitness/stress-level-calculator" className="text-primary underline">Stress Level Calculator</a></li>
                  <li><a href="/category/health-fitness/daily-activity-points-calculator" className="text-primary underline">Daily Activity Points Calculator</a></li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

