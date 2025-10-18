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
import { Activity, TrendingUp, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

const formSchema = z.object({
  injuryType: z.enum(['sprain', 'strain', 'fracture', 'tendonitis', 'bursitis', 'muscle_tear', 'ligament_tear', 'post_surgical', 'chronic_pain']),
  recoveryStage: z.enum(['acute', 'subacute', 'chronic', 'return_to_sport']),
  painLevel: z.number().min(0).max(10, 'Pain level must be between 0 and 10'),
  age: z.number().min(1).max(120, 'Age must be between 1 and 120'),
  fitnessLevel: z.enum(['poor', 'average', 'good', 'excellent']),
  sessionFrequency: z.enum(['daily', 'every_other_day', '3x_week', '2x_week', 'weekly']),
  treatmentGoals: z.enum(['pain_relief', 'range_of_motion', 'strength', 'function', 'sport_return']),
  previousPT: z.enum(['none', 'same_condition', 'different_condition', 'multiple']),
});

type FormValues = z.infer<typeof formSchema>;

const getIntensityInterpretation = (intensity: number, recoveryStage: string, painLevel: number) => {
  if (intensity > 8) {
    return {
      category: 'High Intensity',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: AlertTriangle,
      description: 'High intensity session. Monitor closely for pain and fatigue. Consider reducing intensity.',
      recommendations: [
        'Monitor pain levels closely during and after session',
        'Ensure adequate rest between exercises',
        'Consider reducing intensity if pain increases',
        'Focus on proper form over intensity'
      ]
    };
  } else if (intensity > 6) {
    return {
      category: 'Moderate-High Intensity',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      icon: TrendingUp,
      description: 'Moderate-high intensity session. Good for advancing rehabilitation goals.',
      recommendations: [
        'Maintain current intensity if well-tolerated',
        'Monitor for delayed onset muscle soreness',
        'Ensure proper warm-up and cool-down',
        'Adjust based on next-day response'
      ]
    };
  } else if (intensity > 4) {
    return {
      category: 'Moderate Intensity',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      icon: Activity,
      description: 'Moderate intensity session. Appropriate for most rehabilitation stages.',
      recommendations: [
        'Continue with current progression',
        'Focus on quality of movement',
        'Gradually increase intensity over time',
        'Monitor for any adverse reactions'
      ]
    };
  } else {
    return {
      category: 'Low Intensity',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: CheckCircle,
      description: 'Low intensity session. Appropriate for early recovery stages or high pain levels.',
      recommendations: [
        'Focus on pain-free movement',
        'Emphasize proper technique',
        'Gradually progress intensity',
        'Prioritize consistency over intensity'
      ]
    };
  }
};

const calculateSessionIntensity = (data: FormValues) => {
  let baseIntensity = 5; // Start with moderate intensity
  
  // Recovery stage adjustments
  const stageMultipliers = {
    acute: 0.4,
    subacute: 0.7,
    chronic: 1.0,
    return_to_sport: 1.3,
  };
  baseIntensity *= stageMultipliers[data.recoveryStage as keyof typeof stageMultipliers];
  
  // Pain level adjustments (inverse relationship)
  const painAdjustment = (10 - data.painLevel) / 10;
  baseIntensity *= painAdjustment;
  
  // Age adjustments
  if (data.age > 65) baseIntensity *= 0.8;
  else if (data.age > 50) baseIntensity *= 0.9;
  else if (data.age < 18) baseIntensity *= 1.1;
  
  // Fitness level adjustments
  const fitnessMultipliers = {
    poor: 0.7,
    average: 1.0,
    good: 1.2,
    excellent: 1.4,
  };
  baseIntensity *= fitnessMultipliers[data.fitnessLevel as keyof typeof fitnessMultipliers];
  
  // Session frequency adjustments
  const frequencyMultipliers = {
    daily: 0.6,
    every_other_day: 0.8,
    '3x_week': 1.0,
    '2x_week': 1.2,
    weekly: 1.4,
  };
  baseIntensity *= frequencyMultipliers[data.sessionFrequency as keyof typeof frequencyMultipliers];
  
  // Treatment goal adjustments
  const goalMultipliers = {
    pain_relief: 0.6,
    range_of_motion: 0.8,
    strength: 1.2,
    function: 1.0,
    sport_return: 1.3,
  };
  baseIntensity *= goalMultipliers[data.treatmentGoals as keyof typeof goalMultipliers];
  
  // Previous PT experience adjustments
  const experienceMultipliers = {
    none: 0.8,
    same_condition: 1.0,
    different_condition: 0.9,
    multiple: 1.1,
  };
  baseIntensity *= experienceMultipliers[data.previousPT as keyof typeof experienceMultipliers];
  
  return Math.max(1, Math.min(10, baseIntensity));
};

export default function PhysicalTherapySessionIntensityCalculator() {
  const [result, setResult] = useState<{
    intensity: number;
    interpretation: ReturnType<typeof getIntensityInterpretation>;
    recommendations: string[];
    sessionComponents: {
      warmup: { duration: number; intensity: number };
      main: { duration: number; intensity: number };
      cooldown: { duration: number; intensity: number };
    };
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      injuryType: 'sprain',
      recoveryStage: 'subacute',
      painLevel: 3,
      age: 0,
      fitnessLevel: 'average',
      sessionFrequency: '3x_week',
      treatmentGoals: 'function',
      previousPT: 'none',
    },
  });

  const onSubmit = (data: FormValues) => {
    const intensity = calculateSessionIntensity(data);
    const interpretation = getIntensityInterpretation(intensity, data.recoveryStage, data.painLevel);
    
    // Calculate session components based on intensity
    const sessionComponents = {
      warmup: {
        duration: Math.round(10 + (intensity * 2)),
        intensity: Math.max(1, intensity * 0.3)
      },
      main: {
        duration: Math.round(30 + (intensity * 5)),
        intensity: intensity
      },
      cooldown: {
        duration: Math.round(10 + (intensity * 1)),
        intensity: Math.max(1, intensity * 0.2)
      }
    };
    
    setResult({
      intensity,
      interpretation,
      recommendations: interpretation.recommendations,
      sessionComponents,
    });
  };

  const resetCalculator = () => {
    form.reset();
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Activity className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Physical Therapy Session Intensity Calculator</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Calculate optimal intensity for your physical therapy sessions based on recovery stage and condition
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Session Intensity Calculation
          </CardTitle>
          <CardDescription>
            Enter your condition and recovery details to determine optimal session intensity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="injuryType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Injury/Condition Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select injury type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sprain">Sprain</SelectItem>
                          <SelectItem value="strain">Strain</SelectItem>
                          <SelectItem value="fracture">Fracture</SelectItem>
                          <SelectItem value="tendonitis">Tendonitis</SelectItem>
                          <SelectItem value="bursitis">Bursitis</SelectItem>
                          <SelectItem value="muscle_tear">Muscle Tear</SelectItem>
                          <SelectItem value="ligament_tear">Ligament Tear</SelectItem>
                          <SelectItem value="post_surgical">Post-Surgical</SelectItem>
                          <SelectItem value="chronic_pain">Chronic Pain</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recoveryStage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recovery Stage</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select recovery stage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="acute">Acute (0-2 weeks)</SelectItem>
                          <SelectItem value="subacute">Subacute (2-6 weeks)</SelectItem>
                          <SelectItem value="chronic">Chronic (6+ weeks)</SelectItem>
                          <SelectItem value="return_to_sport">Return to Sport</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="painLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Pain Level (0-10)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          placeholder="Enter pain level"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fitnessLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fitness Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select fitness level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="poor">Poor</SelectItem>
                          <SelectItem value="average">Average</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="excellent">Excellent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sessionFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session Frequency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select session frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="every_other_day">Every Other Day</SelectItem>
                          <SelectItem value="3x_week">3x per Week</SelectItem>
                          <SelectItem value="2x_week">2x per Week</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="treatmentGoals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Treatment Goal</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select treatment goal" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pain_relief">Pain Relief</SelectItem>
                          <SelectItem value="range_of_motion">Range of Motion</SelectItem>
                          <SelectItem value="strength">Strength</SelectItem>
                          <SelectItem value="function">Function</SelectItem>
                          <SelectItem value="sport_return">Return to Sport</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="previousPT"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Previous PT Experience</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select previous PT experience" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="same_condition">Same Condition</SelectItem>
                          <SelectItem value="different_condition">Different Condition</SelectItem>
                          <SelectItem value="multiple">Multiple Conditions</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                  Calculate Intensity
                </Button>
                <Button type="button" variant="outline" onClick={resetCalculator}>
                  Reset
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card className={`${result.interpretation.bgColor} ${result.interpretation.borderColor} border-2`}>
            <CardHeader>
              <CardTitle className={`${result.interpretation.color} flex items-center gap-2`}>
                <result.interpretation.icon className="h-5 w-5" />
                {result.interpretation.category}
              </CardTitle>
              <CardDescription className="text-gray-700">
                {result.interpretation.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-4xl font-bold text-primary">{result.intensity.toFixed(1)}/10</div>
                <div className="text-sm text-muted-foreground">Recommended Session Intensity</div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Recommendations:</h4>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Warm-up ({result.sessionComponents.warmup.duration} minutes)</span>
                    <span>Intensity: {result.sessionComponents.warmup.intensity.toFixed(1)}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(result.sessionComponents.warmup.intensity / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Main Exercises ({result.sessionComponents.main.duration} minutes)</span>
                    <span>Intensity: {result.sessionComponents.main.intensity.toFixed(1)}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(result.sessionComponents.main.intensity / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Cool-down ({result.sessionComponents.cooldown.duration} minutes)</span>
                    <span>Intensity: {result.sessionComponents.cooldown.intensity.toFixed(1)}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(result.sessionComponents.cooldown.intensity / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding">
          <AccordionTrigger className="text-left">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Understanding Physical Therapy Session Intensity
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>For more detailed information on physical therapy session planning and intensity management, consult these authoritative sources:</p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li><a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3133579/" target="_blank" rel="noopener noreferrer" className="text-primary underline">National Center for Biotechnology Information – Physical Therapy</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <section
        className="space-y-4 text-muted-foreground leading-relaxed"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="headline" content="Physical Therapy Session Intensity Calculator – Optimize Rehabilitation Sessions" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="How to calculate optimal PT session intensity, understand recovery stages, and maximize rehabilitation outcomes." />

        <h2 itemProp="name" className="text-xl font-bold text-foreground">Understanding Physical Therapy Session Intensity</h2>
        <p itemProp="description">Optimal physical therapy session intensity varies based on injury type, recovery stage, pain levels, and individual factors. Proper intensity ensures effective rehabilitation without causing setbacks.</p>

        <h3 className="font-semibold text-foreground mt-6">Recovery Stages and Intensity</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Acute Stage:</strong> Low intensity focused on pain management and protection</li>
          <li><strong>Subacute Stage:</strong> Moderate intensity with gradual progression</li>
          <li><strong>Chronic Stage:</strong> Higher intensity focused on function and strength</li>
          <li><strong>Return to Sport:</strong> High intensity sport-specific training</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Factors Affecting Session Intensity</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Pain Level:</strong> Higher pain typically requires lower intensity</li>
          <li><strong>Recovery Stage:</strong> Earlier stages require more conservative approaches</li>
          <li><strong>Fitness Level:</strong> Better fitness allows for higher intensity</li>
          <li><strong>Session Frequency:</strong> More frequent sessions may require lower intensity</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Session Components</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Warm-up:</strong> 10-20 minutes at 30% of session intensity</li>
          <li><strong>Main Exercises:</strong> 30-60 minutes at calculated intensity</li>
          <li><strong>Cool-down:</strong> 10-15 minutes at 20% of session intensity</li>
          <li><strong>Recovery:</strong> Adequate rest between sessions</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
        <div className="space-y-2">
          <p><Link href="/category/health-fitness/injury-recovery-timeline-calculator" className="text-primary underline">Injury Recovery Timeline Calculator</Link></p>
          <p><Link href="/category/health-fitness/range-of-motion-progress-calculator" className="text-primary underline">Range of Motion Progress Calculator</Link></p>
          <p><Link href="/category/health-fitness/strength-to-weight-ratio-calculator" className="text-primary underline">Strength to Weight Ratio Calculator</Link></p>
          <p><Link href="/category/health-fitness/training-volume-calculator" className="text-primary underline">Training Volume Calculator</Link></p>
        </div>
      </section>
    </div>
  );
}