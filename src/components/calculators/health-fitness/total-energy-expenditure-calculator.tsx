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
import { Flame, Activity, TrendingUp, CheckCircle, Info } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

const formSchema = z.object({
  age: z.number().min(1).max(120, 'Age must be between 1 and 120'),
  weight: z.number().positive('Weight must be positive'),
  height: z.number().positive('Height must be positive'),
  gender: z.enum(['male', 'female']),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  exerciseHours: z.number().min(0).max(24, 'Exercise hours must be between 0 and 24'),
  exerciseIntensity: z.enum(['low', 'moderate', 'high']),
});

type FormValues = z.infer<typeof formSchema>;

const calculateBMR = (age: number, weight: number, height: number, gender: string) => {
  // Mifflin-St Jeor Equation
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
};

const getActivityMultiplier = (activityLevel: string) => {
  switch (activityLevel) {
    case 'sedentary': return 1.2;
    case 'light': return 1.375;
    case 'moderate': return 1.55;
    case 'active': return 1.725;
    case 'very_active': return 1.9;
    default: return 1.2;
  }
};

const getExerciseMultiplier = (intensity: string) => {
  switch (intensity) {
    case 'low': return 3.5;
    case 'moderate': return 5.0;
    case 'high': return 7.0;
    default: return 5.0;
  }
};

const getTEEInterpretation = (tee: number, bmr: number, activityLevel: string) => {
  const activityRatio = tee / bmr;
  
  if (activityRatio < 1.3) {
    return {
      category: 'Low Activity Level',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      icon: Activity,
      description: 'Your total energy expenditure suggests a sedentary lifestyle. Consider increasing daily activity.',
      recommendations: [
        'Aim for at least 150 minutes of moderate exercise per week',
        'Take regular breaks from sitting',
        'Incorporate walking into your daily routine',
        'Consider standing desk or walking meetings'
      ]
    };
  } else if (activityRatio < 1.6) {
    return {
      category: 'Moderate Activity Level',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      icon: TrendingUp,
      description: 'Your energy expenditure indicates a moderately active lifestyle. Good balance of activity and rest.',
      recommendations: [
        'Maintain current activity level',
        'Consider adding strength training 2-3 times per week',
        'Focus on consistency over intensity',
        'Monitor energy levels and adjust as needed'
      ]
    };
  } else {
    return {
      category: 'High Activity Level',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: CheckCircle,
      description: 'Your energy expenditure indicates a very active lifestyle. Ensure adequate nutrition and recovery.',
      recommendations: [
        'Ensure adequate calorie intake to support activity',
        'Focus on quality nutrition and hydration',
        'Prioritize recovery and sleep',
        'Monitor for signs of overtraining'
      ]
    };
  }
};

export default function TotalEnergyExpenditureCalculator() {
  const [result, setResult] = useState<{
    bmr: number;
    tee: number;
    activityCalories: number;
    exerciseCalories: number;
    interpretation: ReturnType<typeof getTEEInterpretation>;
    recommendations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: 0,
      weight: 0,
      height: 0,
      gender: 'male',
      activityLevel: 'moderate',
      exerciseHours: 0,
      exerciseIntensity: 'moderate',
    },
  });

  const onSubmit = (data: FormValues) => {
    const bmr = calculateBMR(data.age, data.weight, data.height, data.gender);
    const activityMultiplier = getActivityMultiplier(data.activityLevel);
    const exerciseMultiplier = getExerciseMultiplier(data.exerciseIntensity);
    
    // Calculate activity calories (BMR * activity multiplier - BMR)
    const activityCalories = bmr * (activityMultiplier - 1);
    
    // Calculate exercise calories
    const exerciseCalories = data.exerciseHours * exerciseMultiplier * data.weight;
    
    // Total Energy Expenditure
    const tee = bmr + activityCalories + exerciseCalories;
    
    const interpretation = getTEEInterpretation(tee, bmr, data.activityLevel);
    
    setResult({
      bmr,
      tee,
      activityCalories,
      exerciseCalories,
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
          <Flame className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Total Energy Expenditure Calculator</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Calculate your daily total energy expenditure including BMR, activity, and exercise for comprehensive calorie needs
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            TEE Calculation
          </CardTitle>
          <CardDescription>
            Enter your personal information to calculate your total daily energy expenditure
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
                  name="activityLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activity Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  name="exerciseHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exercise Hours per Day</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="Enter exercise hours"
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
                          <SelectItem value="low">Low (walking, light yoga)</SelectItem>
                          <SelectItem value="moderate">Moderate (brisk walking, cycling)</SelectItem>
                          <SelectItem value="high">High (running, HIIT, weightlifting)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                  Calculate TEE
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
                  <div className="text-2xl font-bold text-primary">{result.bmr.toFixed(0)}</div>
                  <div className="text-sm text-muted-foreground">BMR (kcal/day)</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{result.tee.toFixed(0)}</div>
                  <div className="text-sm text-muted-foreground">Total TEE (kcal/day)</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{result.exerciseCalories.toFixed(0)}</div>
                  <div className="text-sm text-muted-foreground">Exercise Calories</div>
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
              <CardTitle>Energy Expenditure Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Basal Metabolic Rate (BMR)</span>
                    <span>{result.bmr.toFixed(0)} kcal/day</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(result.bmr / result.tee) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Activity Calories</span>
                    <span>{result.activityCalories.toFixed(0)} kcal/day</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(result.activityCalories / result.tee) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Exercise Calories</span>
                    <span>{result.exerciseCalories.toFixed(0)} kcal/day</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(result.exerciseCalories / result.tee) * 100}%` }}
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
              Understanding Total Energy Expenditure (TEE)
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>For more detailed information on total energy expenditure and metabolic calculations, consult these authoritative sources:</p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li><a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3003639/" target="_blank" rel="noopener noreferrer" className="text-primary underline">National Center for Biotechnology Information – Energy Expenditure</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <section
        className="space-y-4 text-muted-foreground leading-relaxed"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="headline" content="Total Energy Expenditure Calculator – Comprehensive Daily Calorie Needs Assessment" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="How to calculate total energy expenditure, understand BMR, activity calories, and exercise calories for optimal nutrition planning." />

        <h2 itemProp="name" className="text-xl font-bold text-foreground">Understanding Total Energy Expenditure</h2>
        <p itemProp="description">Total Energy Expenditure (TEE) represents the total number of calories your body burns in a day, including basal metabolic rate, activity calories, and exercise calories.</p>

        <h3 className="font-semibold text-foreground mt-6">Components of TEE</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Basal Metabolic Rate (BMR):</strong> Calories burned at rest for basic bodily functions</li>
          <li><strong>Activity Calories:</strong> Calories burned through daily activities and non-exercise movement</li>
          <li><strong>Exercise Calories:</strong> Calories burned during structured exercise and physical activity</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Factors Affecting TEE</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Age:</strong> TEE generally decreases with age due to muscle mass loss</li>
          <li><strong>Body Composition:</strong> Muscle mass increases BMR and overall TEE</li>
          <li><strong>Activity Level:</strong> Higher activity levels significantly increase TEE</li>
          <li><strong>Exercise Intensity:</strong> Higher intensity exercise burns more calories per hour</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Practical Applications</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Weight Management:</strong> Use TEE to determine calorie needs for weight loss or gain</li>
          <li><strong>Nutrition Planning:</strong> Plan meals and snacks based on daily energy needs</li>
          <li><strong>Exercise Programming:</strong> Adjust exercise volume based on energy expenditure goals</li>
          <li><strong>Performance Optimization:</strong> Ensure adequate calorie intake for athletic performance</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
        <div className="space-y-2">
          <p><Link href="/category/health-fitness/bmr-calculator" className="text-primary underline">BMR Calculator</Link></p>
          <p><Link href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary underline">Daily Calorie Needs Calculator</Link></p>
          <p><Link href="/category/health-fitness/exercise-calorie-burn-calculator" className="text-primary underline">Exercise Calorie Burn Calculator</Link></p>
          <p><Link href="/category/health-fitness/macro-ratio-calculator" className="text-primary underline">Macro Ratio Calculator</Link></p>
        </div>
      </section>
    </div>
  );
}