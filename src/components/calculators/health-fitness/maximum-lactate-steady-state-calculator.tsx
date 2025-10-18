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
  age: z.number().min(1).max(120, 'Age must be between 1 and 120'),
  weight: z.number().positive('Weight must be positive'),
  height: z.number().positive('Height must be positive'),
  gender: z.enum(['male', 'female']),
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced', 'elite']),
  sport: z.enum(['running', 'cycling', 'swimming', 'rowing', 'cross_training']),
  lactateThreshold: z.number().positive('Lactate threshold must be positive'),
  maxHeartRate: z.number().positive('Max heart rate must be positive'),
  restingHeartRate: z.number().positive('Resting heart rate must be positive'),
});

type FormValues = z.infer<typeof formSchema>;

const getMLSSInterpretation = (mlss: number, fitnessLevel: string, sport: string) => {
  const sportMultipliers = {
    running: 1.0,
    cycling: 1.1,
    swimming: 0.9,
    rowing: 1.05,
    cross_training: 0.95,
  };
  
  const adjustedMLSS = mlss * sportMultipliers[sport as keyof typeof sportMultipliers];
  
  if (adjustedMLSS > 85) {
    return {
      category: 'Excellent MLSS',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: CheckCircle,
      description: 'Outstanding lactate steady state! You can maintain high intensity for extended periods.',
      recommendations: [
        'Focus on race-specific training at MLSS intensity',
        'Incorporate longer intervals (15-30 minutes)',
        'Consider advanced training techniques',
        'Monitor recovery between high-intensity sessions'
      ]
    };
  } else if (adjustedMLSS > 75) {
    return {
      category: 'Good MLSS',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      icon: TrendingUp,
      description: 'Good lactate steady state. You have solid endurance capacity for sustained efforts.',
      recommendations: [
        'Continue building aerobic base',
        'Include MLSS intervals in training',
        'Gradually increase interval duration',
        'Focus on consistency in training'
      ]
    };
  } else if (adjustedMLSS > 65) {
    return {
      category: 'Moderate MLSS',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      icon: Activity,
      description: 'Moderate lactate steady state. Focus on building aerobic endurance.',
      recommendations: [
        'Increase aerobic base training',
        'Include longer, easier sessions',
        'Build up to MLSS training gradually',
        'Focus on training consistency'
      ]
    };
  } else {
    return {
      category: 'Developing MLSS',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      icon: AlertTriangle,
      description: 'Developing lactate steady state. Focus on building aerobic foundation first.',
      recommendations: [
        'Prioritize aerobic base building',
        'Start with longer, easier sessions',
        'Gradually introduce tempo work',
        'Focus on training consistency over intensity'
      ]
    };
  }
};

const calculateMLSS = (data: FormValues) => {
  // Base MLSS calculation using heart rate reserve
  const heartRateReserve = data.maxHeartRate - data.restingHeartRate;
  const mlssHeartRate = data.restingHeartRate + (heartRateReserve * 0.85);
  
  // Adjust based on fitness level
  const fitnessMultipliers = {
    beginner: 0.8,
    intermediate: 0.85,
    advanced: 0.9,
    elite: 0.95,
  };
  
  const adjustedMLSS = mlssHeartRate * fitnessMultipliers[data.fitnessLevel as keyof typeof fitnessMultipliers];
  
  return {
    mlssHeartRate: adjustedMLSS,
    mlssPercentage: (adjustedMLSS / data.maxHeartRate) * 100,
    heartRateReserve,
  };
};

export default function MaximumLactateSteadyStateCalculator() {
  const [result, setResult] = useState<{
    mlssHeartRate: number;
    mlssPercentage: number;
    interpretation: ReturnType<typeof getMLSSInterpretation>;
    recommendations: string[];
    trainingZones: {
      aerobic: { min: number; max: number };
      threshold: { min: number; max: number };
      vo2max: { min: number; max: number };
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
      lactateThreshold: 0,
      maxHeartRate: 0,
      restingHeartRate: 0,
    },
  });

  const onSubmit = (data: FormValues) => {
    const mlssData = calculateMLSS(data);
    const interpretation = getMLSSInterpretation(mlssData.mlssPercentage, data.fitnessLevel, data.sport);
    
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
      vo2max: {
        min: data.restingHeartRate + (heartRateReserve * 0.9),
        max: data.maxHeartRate,
      },
    };
    
    setResult({
      mlssHeartRate: mlssData.mlssHeartRate,
      mlssPercentage: mlssData.mlssPercentage,
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
          <Activity className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Maximum Lactate Steady State Calculator</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Calculate your MLSS for optimal endurance training intensity and lactate threshold determination
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            MLSS Calculation
          </CardTitle>
          <CardDescription>
            Enter your personal and fitness information to calculate your maximum lactate steady state
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
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700">
                  Calculate MLSS
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
                  <div className="text-2xl font-bold text-primary">{result.mlssHeartRate.toFixed(0)} bpm</div>
                  <div className="text-sm text-muted-foreground">MLSS Heart Rate</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{result.mlssPercentage.toFixed(1)}%</div>
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
                    <span>Threshold Zone (MLSS)</span>
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
                    <span>VO2 Max Zone</span>
                    <span>{result.trainingZones.vo2max.min.toFixed(0)} - {result.trainingZones.vo2max.max.toFixed(0)} bpm</span>
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
              Understanding Maximum Lactate Steady State (MLSS)
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>For more detailed information on maximum lactate steady state and endurance training, consult these authoritative sources:</p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li><a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3133579/" target="_blank" rel="noopener noreferrer" className="text-primary underline">National Center for Biotechnology Information – MLSS Training</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <section
        className="space-y-4 text-muted-foreground leading-relaxed"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="headline" content="Maximum Lactate Steady State Calculator – Optimize Endurance Training Intensity" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="How to calculate MLSS, understand lactate threshold training, and optimize endurance performance." />

        <h2 itemProp="name" className="text-xl font-bold text-foreground">Understanding Maximum Lactate Steady State</h2>
        <p itemProp="description">Maximum Lactate Steady State (MLSS) is the highest exercise intensity that can be maintained for extended periods without continuous lactate accumulation.</p>

        <h3 className="font-semibold text-foreground mt-6">What is MLSS?</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Definition:</strong> The highest intensity where lactate production equals lactate clearance</li>
          <li><strong>Duration:</strong> Can typically be maintained for 30-60 minutes</li>
          <li><strong>Heart Rate:</strong> Usually occurs at 80-90% of maximum heart rate</li>
          <li><strong>Importance:</strong> Key determinant of endurance performance</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">MLSS Training Benefits</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Improved Endurance:</strong> Increases time to exhaustion at high intensities</li>
          <li><strong>Lactate Clearance:</strong> Enhances the body's ability to process lactate</li>
          <li><strong>Metabolic Efficiency:</strong> Improves fuel utilization during exercise</li>
          <li><strong>Race Performance:</strong> Directly translates to better race times</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Training at MLSS</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Interval Duration:</strong> 10-30 minutes at MLSS intensity</li>
          <li><strong>Recovery:</strong> 2-5 minutes easy between intervals</li>
          <li><strong>Frequency:</strong> 1-2 sessions per week maximum</li>
          <li><strong>Progression:</strong> Start with shorter intervals and build up</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
        <div className="space-y-2">
          <p><Link href="/category/health-fitness/anaerobic-threshold-calculator" className="text-primary underline">Anaerobic Threshold Calculator</Link></p>
          <p><Link href="/category/health-fitness/vo2-max-calculator" className="text-primary underline">VO2 Max Calculator</Link></p>
          <p><Link href="/category/health-fitness/heart-rate-zone-training-calculator" className="text-primary underline">Heart Rate Zone Training Calculator</Link></p>
          <p><Link href="/category/health-fitness/training-volume-calculator" className="text-primary underline">Training Volume Calculator</Link></p>
        </div>
      </section>
    </div>
  );
}