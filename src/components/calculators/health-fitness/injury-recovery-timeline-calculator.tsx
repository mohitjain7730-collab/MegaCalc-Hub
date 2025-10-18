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
import { Heart, Activity, TrendingUp, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

const formSchema = z.object({
  injuryType: z.enum(['sprain', 'strain', 'fracture', 'tendonitis', 'bursitis', 'muscle_tear', 'ligament_tear', 'dislocation', 'contusion']),
  severity: z.enum(['mild', 'moderate', 'severe']),
  age: z.number().min(1).max(120, 'Age must be between 1 and 120'),
  fitnessLevel: z.enum(['poor', 'average', 'good', 'excellent']),
  previousInjuries: z.enum(['none', 'same_area', 'different_area', 'multiple']),
  treatmentCompliance: z.enum(['poor', 'fair', 'good', 'excellent']),
  nutrition: z.enum(['poor', 'average', 'good', 'excellent']),
  sleep: z.enum(['poor', 'average', 'good', 'excellent']),
});

type FormValues = z.infer<typeof formSchema>;

const getInjuryRecoveryInterpretation = (recoveryTime: number, injuryType: string, severity: string) => {
  const baseRecoveryTimes = {
    sprain: { mild: 7, moderate: 21, severe: 42 },
    strain: { mild: 7, moderate: 21, severe: 42 },
    fracture: { mild: 28, moderate: 56, severe: 84 },
    tendonitis: { mild: 14, moderate: 42, severe: 84 },
    bursitis: { mild: 7, moderate: 21, severe: 42 },
    muscle_tear: { mild: 14, moderate: 42, severe: 84 },
    ligament_tear: { mild: 21, moderate: 56, severe: 112 },
    dislocation: { mild: 14, moderate: 28, severe: 56 },
    contusion: { mild: 7, moderate: 14, severe: 28 },
  };
  
  const expectedTime = baseRecoveryTimes[injuryType as keyof typeof baseRecoveryTimes][severity as keyof typeof baseRecoveryTimes[typeof injuryType]];
  const timeDifference = recoveryTime - expectedTime;
  
  if (timeDifference < -7) {
    return {
      category: 'Excellent Recovery Progress',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: CheckCircle,
      description: 'Excellent recovery progress! You are healing faster than expected. Keep up the good work.',
      recommendations: [
        'Continue current treatment plan',
        'Maintain excellent compliance with therapy',
        'Gradually increase activity as tolerated',
        'Monitor for any setbacks'
      ]
    };
  } else if (timeDifference < 7) {
    return {
      category: 'Normal Recovery Progress',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      icon: TrendingUp,
      description: 'Normal recovery progress. You are healing at the expected rate for your injury type and severity.',
      recommendations: [
        'Continue following treatment plan',
        'Maintain good compliance with therapy',
        'Be patient with the healing process',
        'Focus on prevention of re-injury'
      ]
    };
  } else if (timeDifference < 21) {
    return {
      category: 'Slower Recovery Progress',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      icon: Activity,
      description: 'Recovery is progressing slower than expected. Consider adjusting your approach.',
      recommendations: [
        'Review and optimize treatment plan',
        'Improve compliance with therapy',
        'Address any lifestyle factors',
        'Consider additional treatment modalities'
      ]
    };
  } else {
    return {
      category: 'Delayed Recovery',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: AlertTriangle,
      description: 'Recovery is significantly delayed. Immediate attention and plan modification needed.',
      recommendations: [
        'Consult with healthcare provider immediately',
        'Reassess treatment approach',
        'Consider imaging or additional diagnostics',
        'Address all contributing factors'
      ]
    };
  }
};

const calculateRecoveryTime = (data: FormValues) => {
  // Base recovery times by injury type and severity
  const baseRecoveryTimes = {
    sprain: { mild: 7, moderate: 21, severe: 42 },
    strain: { mild: 7, moderate: 21, severe: 42 },
    fracture: { mild: 28, moderate: 56, severe: 84 },
    tendonitis: { mild: 14, moderate: 42, severe: 84 },
    bursitis: { mild: 7, moderate: 21, severe: 42 },
    muscle_tear: { mild: 14, moderate: 42, severe: 84 },
    ligament_tear: { mild: 21, moderate: 56, severe: 112 },
    dislocation: { mild: 14, moderate: 28, severe: 56 },
    contusion: { mild: 7, moderate: 14, severe: 28 },
  };
  
  let baseTime = baseRecoveryTimes[data.injuryType as keyof typeof baseRecoveryTimes][data.severity as keyof typeof baseRecoveryTimes[typeof data.injuryType]];
  
  // Age adjustments
  if (data.age > 65) baseTime *= 1.3;
  else if (data.age > 50) baseTime *= 1.15;
  else if (data.age < 18) baseTime *= 0.8;
  
  // Fitness level adjustments
  const fitnessMultipliers = {
    poor: 1.2,
    average: 1.0,
    good: 0.9,
    excellent: 0.8,
  };
  baseTime *= fitnessMultipliers[data.fitnessLevel as keyof typeof fitnessMultipliers];
  
  // Previous injury adjustments
  const injuryMultipliers = {
    none: 1.0,
    same_area: 1.3,
    different_area: 1.1,
    multiple: 1.4,
  };
  baseTime *= injuryMultipliers[data.previousInjuries as keyof typeof injuryMultipliers];
  
  // Treatment compliance adjustments
  const complianceMultipliers = {
    poor: 1.4,
    fair: 1.2,
    good: 1.0,
    excellent: 0.8,
  };
  baseTime *= complianceMultipliers[data.treatmentCompliance as keyof typeof complianceMultipliers];
  
  // Nutrition adjustments
  const nutritionMultipliers = {
    poor: 1.2,
    average: 1.0,
    good: 0.9,
    excellent: 0.8,
  };
  baseTime *= nutritionMultipliers[data.nutrition as keyof typeof nutritionMultipliers];
  
  // Sleep adjustments
  const sleepMultipliers = {
    poor: 1.2,
    average: 1.0,
    good: 0.9,
    excellent: 0.8,
  };
  baseTime *= sleepMultipliers[data.sleep as keyof typeof sleepMultipliers];
  
  return Math.round(baseTime);
};

export default function InjuryRecoveryTimelineCalculator() {
  const [result, setResult] = useState<{
    recoveryTime: number;
    interpretation: ReturnType<typeof getInjuryRecoveryInterpretation>;
    recommendations: string[];
    phases: {
      acute: { duration: number; description: string };
      subacute: { duration: number; description: string };
      chronic: { duration: number; description: string };
    };
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      injuryType: 'sprain',
      severity: 'moderate',
      age: 0,
      fitnessLevel: 'average',
      previousInjuries: 'none',
      treatmentCompliance: 'good',
      nutrition: 'good',
      sleep: 'good',
    },
  });

  const onSubmit = (data: FormValues) => {
    const recoveryTime = calculateRecoveryTime(data);
    const interpretation = getInjuryRecoveryInterpretation(recoveryTime, data.injuryType, data.severity);
    
    // Calculate recovery phases
    const phases = {
      acute: {
        duration: Math.round(recoveryTime * 0.3),
        description: 'Inflammation and initial healing phase'
      },
      subacute: {
        duration: Math.round(recoveryTime * 0.4),
        description: 'Tissue repair and early rehabilitation phase'
      },
      chronic: {
        duration: Math.round(recoveryTime * 0.3),
        description: 'Remodeling and return to activity phase'
      }
    };
    
    setResult({
      recoveryTime,
      interpretation,
      recommendations: interpretation.recommendations,
      phases,
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
          <Heart className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Injury Recovery Timeline Calculator</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Estimate your injury recovery timeline based on injury type, severity, and individual factors
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recovery Timeline Calculation
          </CardTitle>
          <CardDescription>
            Enter your injury details and personal factors to estimate recovery time
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
                      <FormLabel>Injury Type</FormLabel>
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
                          <SelectItem value="dislocation">Dislocation</SelectItem>
                          <SelectItem value="contusion">Contusion</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="severity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Severity</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select severity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="mild">Mild</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="severe">Severe</SelectItem>
                        </SelectContent>
                      </Select>
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
                  name="previousInjuries"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Previous Injuries</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select previous injuries" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="same_area">Same Area</SelectItem>
                          <SelectItem value="different_area">Different Area</SelectItem>
                          <SelectItem value="multiple">Multiple</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="treatmentCompliance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Treatment Compliance</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select treatment compliance" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="poor">Poor</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
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
                  name="nutrition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nutrition Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select nutrition status" />
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
                  name="sleep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleep Quality</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select sleep quality" />
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
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                  Calculate Recovery Time
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
                <div className="text-4xl font-bold text-primary">{result.recoveryTime} days</div>
                <div className="text-sm text-muted-foreground">Estimated Recovery Time</div>
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
              <CardTitle>Recovery Phases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Acute Phase ({result.phases.acute.description})</span>
                    <span>{result.phases.acute.duration} days</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: '30%' }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Subacute Phase ({result.phases.subacute.description})</span>
                    <span>{result.phases.subacute.duration} days</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: '70%' }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Chronic Phase ({result.phases.chronic.description})</span>
                    <span>{result.phases.chronic.duration} days</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: '100%' }}
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
              Understanding Injury Recovery Timelines
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>For more detailed information on injury recovery and rehabilitation timelines, consult these authoritative sources:</p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li><a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3133579/" target="_blank" rel="noopener noreferrer" className="text-primary underline">National Center for Biotechnology Information – Injury Recovery</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <section
        className="space-y-4 text-muted-foreground leading-relaxed"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="headline" content="Injury Recovery Timeline Calculator – Estimate Healing Time and Rehabilitation Progress" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="How to estimate injury recovery time, understand healing phases, and optimize rehabilitation outcomes." />

        <h2 itemProp="name" className="text-xl font-bold text-foreground">Understanding Injury Recovery Timelines</h2>
        <p itemProp="description">Injury recovery time varies significantly based on injury type, severity, individual factors, and treatment compliance. Understanding these timelines helps set realistic expectations.</p>

        <h3 className="font-semibold text-foreground mt-6">Recovery Phases</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Acute Phase (0-30% of recovery):</strong> Inflammation, pain, and initial healing</li>
          <li><strong>Subacute Phase (30-70% of recovery):</strong> Tissue repair and early rehabilitation</li>
          <li><strong>Chronic Phase (70-100% of recovery):</strong> Remodeling and return to activity</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Factors Affecting Recovery</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Injury Type:</strong> Different tissues heal at different rates</li>
          <li><strong>Severity:</strong> More severe injuries require longer recovery</li>
          <li><strong>Age:</strong> Younger individuals typically heal faster</li>
          <li><strong>Fitness Level:</strong> Better fitness often leads to faster recovery</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Optimizing Recovery</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Treatment Compliance:</strong> Follow prescribed treatment plans consistently</li>
          <li><strong>Nutrition:</strong> Adequate protein and nutrients support healing</li>
          <li><strong>Sleep:</strong> Quality sleep is essential for recovery</li>
          <li><strong>Stress Management:</strong> High stress can slow healing</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
        <div className="space-y-2">
          <p><Link href="/category/health-fitness/range-of-motion-progress-calculator" className="text-primary underline">Range of Motion Progress Calculator</Link></p>
          <p><Link href="/category/health-fitness/physical-therapy-session-intensity-calculator" className="text-primary underline">Physical Therapy Session Intensity Calculator</Link></p>
          <p><Link href="/category/health-fitness/strength-to-weight-ratio-calculator" className="text-primary underline">Strength to Weight Ratio Calculator</Link></p>
          <p><Link href="/category/health-fitness/training-volume-calculator" className="text-primary underline">Training Volume Calculator</Link></p>
        </div>
      </section>
    </div>
  );
}