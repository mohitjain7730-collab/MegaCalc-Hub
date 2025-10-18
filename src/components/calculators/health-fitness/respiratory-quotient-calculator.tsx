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
import { Wind, Activity, TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

const formSchema = z.object({
  vo2: z.number().positive('VO2 must be positive'),
  vco2: z.number().positive('VCO2 must be positive'),
  activityType: z.enum(['rest', 'light', 'moderate', 'vigorous', 'maximal']),
  duration: z.number().positive('Duration must be positive'),
  intensity: z.number().min(0).max(100, 'Intensity must be between 0-100%'),
});

type FormValues = z.infer<typeof formSchema>;

const getRQInterpretation = (rq: number, activityType: string) => {
  if (rq < 0.7) {
    return {
      category: 'Fat Oxidation Dominant',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: CheckCircle,
      description: 'Your body is primarily burning fat for energy. This is excellent for endurance activities and fat loss goals.',
      recommendations: [
        'Perfect for long-duration, low-intensity exercise',
        'Ideal for fat loss and weight management',
        'Maintain this zone for 60-90 minutes for optimal fat burning',
        'Consider fasted cardio to enhance fat oxidation'
      ]
    };
  } else if (rq < 0.85) {
    return {
      category: 'Mixed Fuel Utilization',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      icon: Activity,
      description: 'Your body is using a balanced mix of carbohydrates and fats. This is the optimal zone for most training.',
      recommendations: [
        'Excellent for moderate-intensity training',
        'Sustainable for longer workout sessions',
        'Good balance between performance and fat burning',
        'Ideal for base building and aerobic development'
      ]
    };
  } else if (rq < 1.0) {
    return {
      category: 'Carbohydrate Dominant',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      icon: TrendingUp,
      description: 'Your body is primarily using carbohydrates for energy. This is normal for higher intensity exercise.',
      recommendations: [
        'Normal for high-intensity training',
        'Ensure adequate carbohydrate intake',
        'Monitor for signs of fatigue or bonking',
        'Consider carb loading for endurance events'
      ]
    };
  } else {
    return {
      category: 'Anaerobic Threshold',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: AlertTriangle,
      description: 'You are at or above your anaerobic threshold. This intensity cannot be sustained for long periods.',
      recommendations: [
        'Reduce intensity to sustainable levels',
        'Focus on interval training at this intensity',
        'Ensure proper recovery between high-intensity sessions',
        'Monitor for signs of overtraining'
      ]
    };
  }
};

const getActivityMultiplier = (activityType: string) => {
  switch (activityType) {
    case 'rest': return 1.0;
    case 'light': return 1.2;
    case 'moderate': return 1.5;
    case 'vigorous': return 2.0;
    case 'maximal': return 2.5;
    default: return 1.0;
  }
};

export default function RespiratoryQuotientCalculator() {
  const [result, setResult] = useState<{
    rq: number;
    interpretation: ReturnType<typeof getRQInterpretation>;
    fuelUtilization: {
      fatPercentage: number;
      carbPercentage: number;
    };
    metabolicEfficiency: number;
    recommendations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vo2: 0,
      vco2: 0,
      activityType: 'moderate',
      duration: 0,
      intensity: 0,
    },
  });

  const onSubmit = (data: FormValues) => {
    const rq = data.vco2 / data.vo2;
    const interpretation = getRQInterpretation(rq, data.activityType);
    
    // Calculate fuel utilization percentages
    const fatPercentage = Math.max(0, Math.min(100, (1 - rq) * 100));
    const carbPercentage = 100 - fatPercentage;
    
    // Calculate metabolic efficiency based on RQ and activity
    const activityMultiplier = getActivityMultiplier(data.activityType);
    const metabolicEfficiency = (rq * activityMultiplier * 100) / 2.5;
    
    setResult({
      rq,
      interpretation,
      fuelUtilization: {
        fatPercentage,
        carbPercentage,
      },
      metabolicEfficiency,
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
          <Wind className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Respiratory Quotient Calculator</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Calculate your respiratory quotient to understand fuel utilization during exercise and metabolic efficiency
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Respiratory Quotient Calculation
          </CardTitle>
          <CardDescription>
            Enter your VO2 and VCO2 measurements to calculate your respiratory quotient
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="vo2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VO2 (ml/kg/min)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="Enter VO2 value"
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
                  name="vco2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VCO2 (ml/kg/min)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="Enter VCO2 value"
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
                  name="activityType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activity Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select activity type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="rest">Rest</SelectItem>
                          <SelectItem value="light">Light Activity</SelectItem>
                          <SelectItem value="moderate">Moderate Activity</SelectItem>
                          <SelectItem value="vigorous">Vigorous Activity</SelectItem>
                          <SelectItem value="maximal">Maximal Activity</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter duration"
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
                  name="intensity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intensity (% of max)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Enter intensity percentage"
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
                <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Calculate RQ
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
                  <div className="text-2xl font-bold text-primary">{result.rq.toFixed(3)}</div>
                  <div className="text-sm text-muted-foreground">Respiratory Quotient</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{result.fuelUtilization.fatPercentage.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Fat Utilization</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{result.fuelUtilization.carbPercentage.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Carb Utilization</div>
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
              <CardTitle>Fuel Utilization Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Fat Oxidation</span>
                    <span>{result.fuelUtilization.fatPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${result.fuelUtilization.fatPercentage}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Carbohydrate Oxidation</span>
                    <span>{result.fuelUtilization.carbPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${result.fuelUtilization.carbPercentage}%` }}
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
              Understanding Respiratory Quotient (RQ)
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>For more detailed information on respiratory quotient and metabolic efficiency, consult these authoritative sources:</p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li><a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3133579/" target="_blank" rel="noopener noreferrer" className="text-primary underline">National Center for Biotechnology Information – Respiratory Quotient</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <section
        className="space-y-4 text-muted-foreground leading-relaxed"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="headline" content="Respiratory Quotient Calculator – Understanding Fuel Utilization During Exercise" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="How to calculate respiratory quotient, interpret RQ values, and optimize training based on fuel utilization patterns." />

        <h2 itemProp="name" className="text-xl font-bold text-foreground">Understanding Respiratory Quotient</h2>
        <p itemProp="description">Respiratory Quotient (RQ) is the ratio of carbon dioxide production (VCO2) to oxygen consumption (VO2) during metabolism. It provides valuable insights into which fuel sources your body is using for energy.</p>

        <h3 className="font-semibold text-foreground mt-6">RQ Values and Their Meaning</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>0.7:</strong> Pure fat oxidation (100% fat, 0% carbohydrate)</li>
          <li><strong>0.8:</strong> Mixed fuel utilization (67% fat, 33% carbohydrate)</li>
          <li><strong>0.85:</strong> Balanced fuel use (50% fat, 50% carbohydrate)</li>
          <li><strong>1.0:</strong> Pure carbohydrate oxidation (0% fat, 100% carbohydrate)</li>
          <li><strong>&gt;1.0:</strong> Anaerobic threshold or lactate production</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Factors Affecting RQ</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Exercise Intensity:</strong> Higher intensity increases carbohydrate utilization</li>
          <li><strong>Training Status:</strong> Well-trained athletes can maintain lower RQ at higher intensities</li>
          <li><strong>Nutritional Status:</strong> Recent carbohydrate intake affects fuel selection</li>
          <li><strong>Duration:</strong> Longer exercise shifts toward fat utilization</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Practical Applications</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Fat Loss:</strong> Train at RQ 0.7-0.8 for optimal fat burning</li>
          <li><strong>Endurance Performance:</strong> Develop ability to maintain low RQ at higher intensities</li>
          <li><strong>Training Zones:</strong> Use RQ to determine optimal training intensities</li>
          <li><strong>Nutrition Timing:</strong> Plan carbohydrate intake based on training RQ</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
        <div className="space-y-2">
          <p><Link href="/category/health-fitness/vo2-max-calculator" className="text-primary underline">VO2 Max Calculator</Link></p>
          <p><Link href="/category/health-fitness/anaerobic-threshold-calculator" className="text-primary underline">Anaerobic Threshold Calculator</Link></p>
          <p><Link href="/category/health-fitness/maximum-lactate-steady-state-calculator" className="text-primary underline">Maximum Lactate Steady State Calculator</Link></p>
          <p><Link href="/category/health-fitness/heart-rate-zone-training-calculator" className="text-primary underline">Heart Rate Zone Training Calculator</Link></p>
        </div>
      </section>
    </div>
  );
}