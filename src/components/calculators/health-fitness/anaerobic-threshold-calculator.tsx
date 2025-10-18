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
import { Zap, Activity, TrendingUp, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

const formSchema = z.object({
  age: z.number().min(1).max(120, 'Age must be between 1 and 120'),
  weight: z.number().positive('Weight must be positive'),
  height: z.number().positive('Height must be positive'),
  gender: z.enum(['male', 'female']),
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced', 'elite']),
  sport: z.enum(['running', 'cycling', 'swimming', 'rowing', 'cross_training']),
  maxHeartRate: z.number().positive('Max heart rate must be positive'),
  restingHeartRate: z.number().positive('Resting heart rate must be positive'),
  lactateThreshold: z.number().positive('Lactate threshold must be positive'),
  vo2max: z.number().positive('VO2 max must be positive'),
});

type FormValues = z.infer<typeof formSchema>;

const getAnaerobicThresholdInterpretation = (thresholdPercentage: number, fitnessLevel: string, sport: string) => {
  const sportMultipliers = {
    running: 1.0,
    cycling: 1.05,
    swimming: 0.95,
    rowing: 1.02,
    cross_training: 0.98,
  };
  
  const adjustedThreshold = thresholdPercentage * sportMultipliers[sport as keyof typeof sportMultipliers];
  
  if (adjustedThreshold > 90) {
    return {
      category: 'Excellent Anaerobic Threshold',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: CheckCircle,
      description: 'Outstanding anaerobic threshold! You can sustain very high intensities for extended periods.',
      recommendations: [
        'Focus on race-specific training at threshold intensity',
        'Incorporate longer threshold intervals (20-40 minutes)',
        'Consider advanced training techniques',
        'Monitor recovery between high-intensity sessions'
      ]
    };
  } else if (adjustedThreshold > 80) {
    return {
      category: 'Good Anaerobic Threshold',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      icon: TrendingUp,
      description: 'Good anaerobic threshold. You have solid ability to sustain high-intensity efforts.',
      recommendations: [
        'Continue building threshold capacity',
        'Include threshold intervals in training',
        'Gradually increase interval duration',
        'Focus on consistency in training'
      ]
    };
  } else if (adjustedThreshold > 70) {
    return {
      category: 'Moderate Anaerobic Threshold',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      icon: Activity,
      description: 'Moderate anaerobic threshold. Focus on building high-intensity endurance.',
      recommendations: [
        'Increase threshold training volume',
        'Include shorter threshold intervals',
        'Build up to longer intervals gradually',
        'Focus on training consistency'
      ]
    };
  } else {
    return {
      category: 'Developing Anaerobic Threshold',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      icon: AlertTriangle,
      description: 'Developing anaerobic threshold. Focus on building aerobic foundation first.',
      recommendations: [
        'Prioritize aerobic base building',
        'Start with shorter, easier intervals',
        'Gradually introduce threshold work',
        'Focus on training consistency over intensity'
      ]
    };
  }
};

const calculateAnaerobicThreshold = (data: FormValues) => {
  // Base threshold calculation using heart rate reserve
  const heartRateReserve = data.maxHeartRate - data.restingHeartRate;
  const thresholdHeartRate = data.restingHeartRate + (heartRateReserve * 0.85);
  
  // Adjust based on fitness level
  const fitnessMultipliers = {
    beginner: 0.8,
    intermediate: 0.85,
    advanced: 0.9,
    elite: 0.95,
  };
  
  const adjustedThreshold = thresholdHeartRate * fitnessMultipliers[data.fitnessLevel as keyof typeof fitnessMultipliers];
  
  return {
    thresholdHeartRate: adjustedThreshold,
    thresholdPercentage: (adjustedThreshold / data.maxHeartRate) * 100,
    heartRateReserve,
  };
};

export default function AnaerobicThresholdCalculator() {
  const [result, setResult] = useState<{
    thresholdHeartRate: number;
    thresholdPercentage: number;
    interpretation: ReturnType<typeof getAnaerobicThresholdInterpretation>;
    recommendations: string[];
    trainingZones: {
      aerobic: { min: number; max: number };
      threshold: { min: number; max: number };
      anaerobic: { min: number; max: number };
    };
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: 0,
      weight: 0,
      height: 0,
      gender: 'male',
      fitnessLevel: 'intermediate',
      sport: 'running',
      maxHeartRate: 0,
      restingHeartRate: 0,
      lactateThreshold: 0,
      vo2max: 0,
    },
  });

  const onSubmit = (data: FormValues) => {
    const thresholdData = calculateAnaerobicThreshold(data);
    const interpretation = getAnaerobicThresholdInterpretation(thresholdData.thresholdPercentage, data.fitnessLevel, data.sport);
    
    // Calculate training zones
    const heartRateReserve = data.maxHeartRate - data.restingHeartRate;
    const trainingZones = {
      aerobic: {
        min: data.restingHeartRate + (heartRateReserve * 0.6),
        max: data.restingHeartRate + (heartRateReserve * 0.75),
      },
      threshold: {
        min: data.restingHeartRate + (heartRateReserve * 0.8),
        max: data.restingHeartRate + (heartRateReserve * 0.9),
      },
      anaerobic: {
        min: data.restingHeartRate + (heartRateReserve * 0.9),
        max: data.maxHeartRate,
      },
    };
    
    setResult({
      thresholdHeartRate: thresholdData.thresholdHeartRate,
      thresholdPercentage: thresholdData.thresholdPercentage,
      interpretation,
      recommendations: interpretation.recommendations,
      trainingZones,
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
          <Zap className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Anaerobic Threshold Calculator</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Calculate your anaerobic threshold for optimal training zone prescription and performance optimization
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Anaerobic Threshold Calculation
          </CardTitle>
          <CardDescription>
            Enter your personal and fitness information to calculate your anaerobic threshold
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="Enter your weight"
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
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter your height"
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
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="elite">Elite</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sport"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Sport</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select sport" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="running">Running</SelectItem>
                          <SelectItem value="cycling">Cycling</SelectItem>
                          <SelectItem value="swimming">Swimming</SelectItem>
                          <SelectItem value="rowing">Rowing</SelectItem>
                          <SelectItem value="cross_training">Cross Training</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxHeartRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Heart Rate (bpm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter max heart rate"
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
                  name="restingHeartRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resting Heart Rate (bpm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter resting heart rate"
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
                  name="lactateThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lactate Threshold (mmol/L)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="Enter lactate threshold"
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
                  name="vo2max"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VO2 Max (ml/kg/min)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="Enter VO2 max"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700">
                  Calculate Threshold
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-primary">{result.thresholdHeartRate.toFixed(0)} bpm</div>
                  <div className="text-sm text-muted-foreground">Anaerobic Threshold</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{result.thresholdPercentage.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">of Max Heart Rate</div>
                </div>
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
              <CardTitle>Training Heart Rate Zones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Aerobic Zone</span>
                    <span>{result.trainingZones.aerobic.min.toFixed(0)} - {result.trainingZones.aerobic.max.toFixed(0)} bpm</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: '60%' }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Threshold Zone</span>
                    <span>{result.trainingZones.threshold.min.toFixed(0)} - {result.trainingZones.threshold.max.toFixed(0)} bpm</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: '80%' }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Anaerobic Zone</span>
                    <span>{result.trainingZones.anaerobic.min.toFixed(0)} - {result.trainingZones.anaerobic.max.toFixed(0)} bpm</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-500"
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
              Understanding Anaerobic Threshold
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>For more detailed information on anaerobic threshold and high-intensity training, consult these authoritative sources:</p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li><a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3133579/" target="_blank" rel="noopener noreferrer" className="text-primary underline">National Center for Biotechnology Information – Anaerobic Threshold</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <section
        className="space-y-4 text-muted-foreground leading-relaxed"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="headline" content="Anaerobic Threshold Calculator – Optimize High-Intensity Training Zones" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="How to calculate anaerobic threshold, understand training zones, and optimize high-intensity performance." />

        <h2 itemProp="name" className="text-xl font-bold text-foreground">Understanding Anaerobic Threshold</h2>
        <p itemProp="description">Anaerobic threshold is the exercise intensity at which lactate begins to accumulate in the blood faster than it can be cleared, marking the transition from aerobic to anaerobic metabolism.</p>

        <h3 className="font-semibold text-foreground mt-6">What is Anaerobic Threshold?</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Definition:</strong> The highest intensity that can be sustained without lactate accumulation</li>
          <li><strong>Duration:</strong> Can typically be maintained for 20-60 minutes</li>
          <li><strong>Heart Rate:</strong> Usually occurs at 80-90% of maximum heart rate</li>
          <li><strong>Importance:</strong> Key determinant of endurance performance</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Threshold Training Benefits</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Improved Endurance:</strong> Increases time to exhaustion at high intensities</li>
          <li><strong>Lactate Tolerance:</strong> Enhances the body's ability to handle lactate</li>
          <li><strong>Metabolic Efficiency:</strong> Improves fuel utilization during exercise</li>
          <li><strong>Race Performance:</strong> Directly translates to better race times</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Training at Threshold</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Interval Duration:</strong> 10-30 minutes at threshold intensity</li>
          <li><strong>Recovery:</strong> 2-5 minutes easy between intervals</li>
          <li><strong>Frequency:</strong> 1-2 sessions per week maximum</li>
          <li><strong>Progression:</strong> Start with shorter intervals and build up</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
        <div className="space-y-2">
          <p><Link href="/category/health-fitness/maximum-lactate-steady-state-calculator" className="text-primary underline">Maximum Lactate Steady State Calculator</Link></p>
          <p><Link href="/category/health-fitness/vo2-max-calculator" className="text-primary underline">VO2 Max Calculator</Link></p>
          <p><Link href="/category/health-fitness/heart-rate-zone-training-calculator" className="text-primary underline">Heart Rate Zone Training Calculator</Link></p>
          <p><Link href="/category/health-fitness/training-volume-calculator" className="text-primary underline">Training Volume Calculator</Link></p>
        </div>
      </section>
    </div>
  );
}