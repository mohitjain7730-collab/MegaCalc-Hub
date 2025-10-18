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
import { Thermometer, Activity, TrendingUp, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

const formSchema = z.object({
  restingTemp: z.number().min(35).max(40, 'Resting temperature must be between 35°C and 40°C'),
  exerciseDuration: z.number().positive('Exercise duration must be positive'),
  exerciseIntensity: z.enum(['low', 'moderate', 'high', 'very_high']),
  environmentalTemp: z.number().min(-20).max(50, 'Environmental temperature must be between -20°C and 50°C'),
  humidity: z.number().min(0).max(100, 'Humidity must be between 0% and 100%'),
  clothing: z.enum(['light', 'moderate', 'heavy']),
  hydration: z.enum(['poor', 'adequate', 'excellent']),
  fitnessLevel: z.enum(['poor', 'average', 'good', 'excellent']),
});

type FormValues = z.infer<typeof formSchema>;

const getTemperatureInterpretation = (tempRise: number, finalTemp: number, exerciseIntensity: string) => {
  if (finalTemp < 38.5) {
    return {
      category: 'Normal Temperature Response',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: CheckCircle,
      description: 'Normal temperature response to exercise. Your body is effectively managing heat production.',
      recommendations: [
        'Continue current exercise routine',
        'Maintain adequate hydration',
        'Monitor during longer sessions',
        'Consider environmental conditions'
      ]
    };
  } else if (finalTemp < 39.5) {
    return {
      category: 'Elevated Temperature',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      icon: TrendingUp,
      description: 'Elevated temperature response. Monitor for signs of heat stress and adjust exercise accordingly.',
      recommendations: [
        'Increase fluid intake',
        'Take more frequent breaks',
        'Reduce exercise intensity if needed',
        'Monitor for heat stress symptoms'
      ]
    };
  } else if (finalTemp < 40.5) {
    return {
      category: 'High Temperature Risk',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      icon: Activity,
      description: 'High temperature risk. Exercise should be modified or stopped to prevent heat illness.',
      recommendations: [
        'Reduce exercise intensity immediately',
        'Increase rest periods',
        'Improve hydration status',
        'Consider cooler exercise conditions'
      ]
    };
  } else {
    return {
      category: 'Dangerous Temperature',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: AlertTriangle,
      description: 'Dangerous temperature level. Stop exercise immediately and seek medical attention.',
      recommendations: [
        'Stop exercise immediately',
        'Move to cooler environment',
        'Begin cooling measures',
        'Seek medical attention if symptoms persist'
      ]
    };
  }
};

const calculateTemperatureRise = (data: FormValues) => {
  // Base temperature rise from exercise intensity
  const intensityMultipliers = {
    low: 0.5,
    moderate: 1.0,
    high: 1.8,
    very_high: 2.5,
  };
  
  let baseRise = intensityMultipliers[data.exerciseIntensity as keyof typeof intensityMultipliers];
  
  // Adjust for exercise duration (longer exercise = more heat accumulation)
  const durationFactor = Math.min(data.exerciseDuration / 60, 2); // Cap at 2x for 2+ hours
  baseRise *= durationFactor;
  
  // Environmental adjustments
  if (data.environmentalTemp > 30) {
    baseRise += (data.environmentalTemp - 30) * 0.1; // 0.1°C per degree above 30°C
  }
  
  if (data.humidity > 70) {
    baseRise += (data.humidity - 70) * 0.01; // Additional rise with high humidity
  }
  
  // Clothing adjustments
  const clothingMultipliers = {
    light: 1.0,
    moderate: 1.2,
    heavy: 1.5,
  };
  baseRise *= clothingMultipliers[data.clothing as keyof typeof clothingMultipliers];
  
  // Hydration adjustments
  const hydrationMultipliers = {
    poor: 1.3,
    adequate: 1.0,
    excellent: 0.8,
  };
  baseRise *= hydrationMultipliers[data.hydration as keyof typeof hydrationMultipliers];
  
  // Fitness level adjustments (better fitness = better heat management)
  const fitnessMultipliers = {
    poor: 1.2,
    average: 1.0,
    good: 0.9,
    excellent: 0.8,
  };
  baseRise *= fitnessMultipliers[data.fitnessLevel as keyof typeof fitnessMultipliers];
  
  const finalTemp = data.restingTemp + baseRise;
  
  return {
    temperatureRise: baseRise,
    finalTemperature: finalTemp,
    heatStressRisk: finalTemp > 39.5 ? 'High' : finalTemp > 38.5 ? 'Moderate' : 'Low',
  };
};

export default function CoreBodyTemperatureRiseCalculator() {
  const [result, setResult] = useState<{
    temperatureRise: number;
    finalTemperature: number;
    heatStressRisk: string;
    interpretation: ReturnType<typeof getTemperatureInterpretation>;
    recommendations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      restingTemp: 37.0,
      exerciseDuration: 0,
      exerciseIntensity: 'moderate',
      environmentalTemp: 20,
      humidity: 50,
      clothing: 'moderate',
      hydration: 'adequate',
      fitnessLevel: 'average',
    },
  });

  const onSubmit = (data: FormValues) => {
    const tempData = calculateTemperatureRise(data);
    const interpretation = getTemperatureInterpretation(tempData.temperatureRise, tempData.finalTemperature, data.exerciseIntensity);
    
    setResult({
      ...tempData,
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
          <Thermometer className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Core Body Temperature Rise Calculator</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Calculate your core body temperature rise during exercise to assess heat stress and safety
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Temperature Rise Calculation
          </CardTitle>
          <CardDescription>
            Enter your exercise and environmental conditions to calculate core body temperature rise
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="restingTemp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resting Core Temperature (°C)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="Enter resting temperature"
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
                  name="environmentalTemp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Environmental Temperature (°C)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="Enter environmental temperature"
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

                <FormField
                  control={form.control}
                  name="hydration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hydration Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select hydration status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="poor">Poor</SelectItem>
                          <SelectItem value="adequate">Adequate</SelectItem>
                          <SelectItem value="excellent">Excellent</SelectItem>
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
                <Button type="submit" className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700">
                  Calculate Temperature Rise
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
                  <div className="text-2xl font-bold text-primary">{result.temperatureRise.toFixed(1)}°C</div>
                  <div className="text-sm text-muted-foreground">Temperature Rise</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{result.finalTemperature.toFixed(1)}°C</div>
                  <div className="text-sm text-muted-foreground">Final Temperature</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{result.heatStressRisk}</div>
                  <div className="text-sm text-muted-foreground">Heat Stress Risk</div>
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
              <CardTitle>Heat Stress Prevention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Hydration</span>
                    <span>Drink 150-250ml every 15-20 minutes</span>
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
                    <span>Rest Periods</span>
                    <span>Take breaks every 15-30 minutes</span>
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
                    <span>Cooling Measures</span>
                    <span>Use fans, shade, or cooling vests</span>
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
              Understanding Core Body Temperature Rise
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>For more detailed information on core body temperature and heat stress management, consult these authoritative sources:</p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li><a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3133579/" target="_blank" rel="noopener noreferrer" className="text-primary underline">National Center for Biotechnology Information – Heat Stress</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <section
        className="space-y-4 text-muted-foreground leading-relaxed"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="headline" content="Core Body Temperature Rise Calculator – Assess Heat Stress During Exercise" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="How to calculate core body temperature rise, understand heat stress risks, and maintain safe exercise conditions." />

        <h2 itemProp="name" className="text-xl font-bold text-foreground">Understanding Core Body Temperature Rise</h2>
        <p itemProp="description">During exercise, your core body temperature rises due to increased metabolic heat production. Understanding this rise helps prevent heat-related illnesses.</p>

        <h3 className="font-semibold text-foreground mt-6">Normal Temperature Ranges</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Resting:</strong> 36.1-37.2°C (97-99°F)</li>
          <li><strong>During Exercise:</strong> 37.5-39.5°C (99.5-103.1°F)</li>
          <li><strong>Heat Stress Risk:</strong> Above 39.5°C (103.1°F)</li>
          <li><strong>Heat Stroke Risk:</strong> Above 40.5°C (104.9°F)</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Factors Affecting Temperature Rise</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Exercise Intensity:</strong> Higher intensity produces more metabolic heat</li>
          <li><strong>Duration:</strong> Longer exercise allows more heat accumulation</li>
          <li><strong>Environmental Conditions:</strong> Heat and humidity impair cooling</li>
          <li><strong>Hydration Status:</strong> Dehydration reduces sweating efficiency</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Heat Stress Prevention</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Hydration:</strong> Maintain adequate fluid intake before, during, and after exercise</li>
          <li><strong>Acclimatization:</strong> Gradually adapt to hot conditions over 7-14 days</li>
          <li><strong>Clothing:</strong> Wear light, breathable clothing in hot conditions</li>
          <li><strong>Timing:</strong> Exercise during cooler parts of the day when possible</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
        <div className="space-y-2">
          <p><Link href="/category/health-fitness/hydration-sweat-rate-calculator" className="text-primary underline">Hydration Sweat Rate Calculator</Link></p>
          <p><Link href="/category/health-fitness/hydration-needs-calculator" className="text-primary underline">Hydration Needs Calculator</Link></p>
          <p><Link href="/category/health-fitness/exercise-calorie-burn-calculator" className="text-primary underline">Exercise Calorie Burn Calculator</Link></p>
          <p><Link href="/category/health-fitness/heat-index-calculator" className="text-primary underline">Heat Index Calculator</Link></p>
        </div>
      </section>
    </div>
  );
}