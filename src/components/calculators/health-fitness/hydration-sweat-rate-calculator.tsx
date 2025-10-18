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
import { Droplets, Activity, TrendingUp, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

const formSchema = z.object({
  weightBefore: z.number().positive('Weight before must be positive'),
  weightAfter: z.number().positive('Weight after must be positive'),
  exerciseDuration: z.number().positive('Exercise duration must be positive'),
  fluidIntake: z.number().min(0, 'Fluid intake cannot be negative'),
  temperature: z.number().min(-20).max(50, 'Temperature must be between -20°C and 50°C'),
  humidity: z.number().min(0).max(100, 'Humidity must be between 0% and 100%'),
  exerciseIntensity: z.enum(['low', 'moderate', 'high', 'very_high']),
  clothing: z.enum(['light', 'moderate', 'heavy']),
});

type FormValues = z.infer<typeof formSchema>;

const getHydrationInterpretation = (sweatRate: number, fluidLoss: number, exerciseDuration: number) => {
  const hourlySweatRate = sweatRate * 60; // Convert to ml/hour
  
  if (hourlySweatRate < 500) {
    return {
      category: 'Low Sweat Rate',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      icon: CheckCircle,
      description: 'Low sweat rate indicates good hydration status and efficient thermoregulation.',
      recommendations: [
        'Maintain current hydration practices',
        'Continue regular fluid intake',
        'Monitor during longer exercise sessions',
        'Consider environmental factors'
      ]
    };
  } else if (hourlySweatRate < 1000) {
    return {
      category: 'Moderate Sweat Rate',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: TrendingUp,
      description: 'Moderate sweat rate is normal for most exercise conditions. Good hydration management needed.',
      recommendations: [
        'Drink 150-250ml every 15-20 minutes during exercise',
        'Monitor urine color for hydration status',
        'Replace fluids within 2 hours post-exercise',
        'Consider electrolyte replacement for longer sessions'
      ]
    };
  } else if (hourlySweatRate < 1500) {
    return {
      category: 'High Sweat Rate',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      icon: Activity,
      description: 'High sweat rate requires careful hydration management to prevent dehydration.',
      recommendations: [
        'Increase fluid intake to 250-400ml every 15-20 minutes',
        'Include electrolyte replacement drinks',
        'Monitor for signs of dehydration',
        'Consider pre-hydration strategies'
      ]
    };
  } else {
    return {
      category: 'Very High Sweat Rate',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: AlertTriangle,
      description: 'Very high sweat rate poses significant dehydration risk. Immediate attention to hydration needed.',
      recommendations: [
        'Aggressive hydration strategy required',
        'Drink 400-600ml every 15-20 minutes',
        'Include sodium and electrolyte replacement',
        'Consider shorter exercise sessions or cooler conditions',
        'Monitor for heat illness symptoms'
      ]
    };
  }
};

const calculateSweatRate = (data: FormValues) => {
  // Calculate weight loss (sweat loss)
  const weightLoss = data.weightBefore - data.weightAfter;
  const weightLossML = weightLoss * 1000; // Convert kg to ml (assuming 1kg = 1L)
  
  // Add fluid intake to get total sweat loss
  const totalSweatLoss = weightLossML + data.fluidIntake;
  
  // Calculate sweat rate (ml/min)
  const sweatRate = totalSweatLoss / data.exerciseDuration;
  
  // Calculate hourly sweat rate
  const hourlySweatRate = sweatRate * 60;
  
  // Calculate fluid replacement needs
  const fluidReplacementPerHour = hourlySweatRate * 0.8; // Replace 80% of sweat loss
  
  return {
    sweatRate,
    hourlySweatRate,
    totalSweatLoss,
    fluidReplacementPerHour,
    weightLoss,
  };
};

export default function HydrationSweatRateCalculator() {
  const [result, setResult] = useState<{
    sweatRate: number;
    hourlySweatRate: number;
    totalSweatLoss: number;
    fluidReplacementPerHour: number;
    weightLoss: number;
    interpretation: ReturnType<typeof getHydrationInterpretation>;
    recommendations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weightBefore: 0,
      weightAfter: 0,
      exerciseDuration: 0,
      fluidIntake: 0,
      temperature: 20,
      humidity: 50,
      exerciseIntensity: 'moderate',
      clothing: 'moderate',
    },
  });

  const onSubmit = (data: FormValues) => {
    const sweatData = calculateSweatRate(data);
    const interpretation = getHydrationInterpretation(sweatData.sweatRate, sweatData.totalSweatLoss, data.exerciseDuration);
    
    setResult({
      ...sweatData,
      interpretation,
      recommendations: interpretation.recommendations,
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
          <Droplets className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Hydration Sweat Rate Calculator</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Calculate your sweat rate to optimize hydration during exercise and prevent dehydration
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Sweat Rate Calculation
          </CardTitle>
          <CardDescription>
            Enter your pre and post-exercise measurements to calculate your sweat rate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="weightBefore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight Before Exercise (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="Enter weight before exercise"
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
                  name="weightAfter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight After Exercise (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="Enter weight after exercise"
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
                  name="exerciseDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exercise Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter exercise duration"
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
                  name="fluidIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fluid Intake During Exercise (ml)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter fluid intake"
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
                  name="temperature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temperature (°C)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="Enter temperature"
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
                  name="humidity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Humidity (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Enter humidity percentage"
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
                  name="exerciseIntensity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exercise Intensity</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select exercise intensity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="very_high">Very High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clothing"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clothing Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select clothing type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="heavy">Heavy</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
                  Calculate Sweat Rate
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-primary">{result.hourlySweatRate.toFixed(0)} ml/hr</div>
                  <div className="text-sm text-muted-foreground">Hourly Sweat Rate</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{result.totalSweatLoss.toFixed(0)} ml</div>
                  <div className="text-sm text-muted-foreground">Total Sweat Loss</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{result.fluidReplacementPerHour.toFixed(0)} ml/hr</div>
                  <div className="text-sm text-muted-foreground">Fluid Replacement</div>
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
              <CardTitle>Hydration Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Pre-Exercise Hydration</span>
                    <span>500-600ml 2-3 hours before</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: '100%' }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>During Exercise</span>
                    <span>{result.fluidReplacementPerHour.toFixed(0)}ml per hour</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: '80%' }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Post-Exercise Recovery</span>
                    <span>150% of sweat loss</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: '60%' }}
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
              Understanding Hydration and Sweat Rate
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>For more detailed information on hydration and sweat rate management, consult these authoritative sources:</p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li><a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3133579/" target="_blank" rel="noopener noreferrer" className="text-primary underline">National Center for Biotechnology Information – Hydration Strategies</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <section
        className="space-y-4 text-muted-foreground leading-relaxed"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="headline" content="Hydration Sweat Rate Calculator – Optimize Fluid Replacement During Exercise" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="How to calculate sweat rate, develop hydration strategies, and prevent dehydration during exercise." />

        <h2 itemProp="name" className="text-xl font-bold text-foreground">Understanding Hydration and Sweat Rate</h2>
        <p itemProp="description">Proper hydration is essential for optimal performance and safety during exercise. Understanding your sweat rate helps develop personalized hydration strategies.</p>

        <h3 className="font-semibold text-foreground mt-6">Factors Affecting Sweat Rate</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Exercise Intensity:</strong> Higher intensity increases sweat production</li>
          <li><strong>Environmental Conditions:</strong> Heat and humidity significantly increase sweat rate</li>
          <li><strong>Fitness Level:</strong> Well-trained athletes sweat more efficiently</li>
          <li><strong>Body Size:</strong> Larger individuals typically sweat more</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Hydration Guidelines</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Pre-Exercise:</strong> Drink 500-600ml 2-3 hours before exercise</li>
          <li><strong>During Exercise:</strong> Replace 80% of sweat loss hourly</li>
          <li><strong>Post-Exercise:</strong> Replace 150% of sweat loss within 2 hours</li>
          <li><strong>Electrolytes:</strong> Include sodium for sessions longer than 60 minutes</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Signs of Dehydration</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Early Signs:</strong> Thirst, dry mouth, decreased performance</li>
          <li><strong>Moderate Signs:</strong> Headache, dizziness, fatigue</li>
          <li><strong>Severe Signs:</strong> Confusion, rapid heartbeat, no sweating</li>
          <li><strong>Prevention:</strong> Monitor urine color and body weight</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
        <div className="space-y-2">
          <p><Link href="/category/health-fitness/hydration-needs-calculator" className="text-primary underline">Hydration Needs Calculator</Link></p>
          <p><Link href="/category/health-fitness/electrolyte-replacement-calculator" className="text-primary underline">Electrolyte Replacement Calculator</Link></p>
          <p><Link href="/category/health-fitness/core-body-temperature-rise-calculator" className="text-primary underline">Core Body Temperature Rise Calculator</Link></p>
          <p><Link href="/category/health-fitness/exercise-calorie-burn-calculator" className="text-primary underline">Exercise Calorie Burn Calculator</Link></p>
        </div>
      </section>
    </div>
  );
}