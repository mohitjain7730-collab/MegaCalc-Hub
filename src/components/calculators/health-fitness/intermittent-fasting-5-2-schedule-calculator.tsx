'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertCircle, Utensils, Activity, Target, TrendingDown, Info, Calculator, CheckCircle2, Clock, Zap, Shield, HelpCircle, Flame, Briefcase, AlertTriangle, Users, Landmark } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  gender: z.enum(['male', 'female']),
  age: z.number().min(18).max(100),
  weight: z.number().positive(),
  height: z.number().positive(),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  fastingDays: z.array(z.string()).min(2, "Select exactly 2 days").max(2, "Select exactly 2 days"),
});

type FormValues = z.infer<typeof formSchema>;

const DAYS_OF_WEEK = [
  { id: 'Monday', label: 'Mon' },
  { id: 'Tuesday', label: 'Tue' },
  { id: 'Wednesday', label: 'Wed' },
  { id: 'Thursday', label: 'Thu' },
  { id: 'Friday', label: 'Fri' },
  { id: 'Saturday', label: 'Sat' },
  { id: 'Sunday', label: 'Sun' },
];

export default function IntermittentFasting52ScheduleCalculator() {
  const [result, setResult] = useState<{
    tdee: number;
    fastingCalories: number;
    weeklyDeficit: number;
    projectedWeightLoss: number;
    schedule: { day: string; type: string; calories: number; macroFocus: string }[];
    consecutiveWarning: boolean;
    interpretation: string;
    bmi: number;
    bmiCategory: string;
    insights: string[];
    risks: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: undefined,
      age: undefined,
      weight: undefined,
      height: undefined,
      activityLevel: undefined,
      fastingDays: [],
    },
  });

  const calculateTDEE = (values: FormValues) => {
    // Mifflin-St Jeor Equation
    let bmr = (10 * values.weight) + (6.25 * values.height) - (5 * values.age);
    bmr += values.gender === 'male' ? 5 : -161;

    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };

    return Math.round(bmr * multipliers[values.activityLevel]);
  };

  const getDayIndex = (day: string) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days.indexOf(day);
  };

  const checkConsecutive = (days: string[]) => {
    const idx1 = getDayIndex(days[0]);
    const idx2 = getDayIndex(days[1]);
    const diff = Math.abs(idx1 - idx2);
    // 1 means consecutive (e.g., Mon-Tue). 6 means Sun-Mon wrapping (if we cared, but typical week view Monday is 0).
    return diff === 1;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  }

  const getInsights = (deficit: number, consecutive: boolean) => {
    const insights = [];
    if (consecutive) {
      insights.push('Consecutive fasting days are challenging');
      insights.push('Risk of energy crashes on day 2');
    } else {
      insights.push('Ideally spaced for recovery');
      insights.push('Sustainable "Feast-Famine" rhythm');
    }

    if (deficit > 4000) insights.push('Aggressive weekly deficit (~1.2lb/week)');
    else if (deficit > 2000) insights.push('Moderate, sustainable fat loss (~0.7lb/week)');
    else insights.push('Maintenance-focused or slow loss');

    insights.push('Autophagy optimized during 500kcal windows');
    return insights;
  };

  const onSubmit = (values: FormValues) => {
    const tdee = calculateTDEE(values);
    // 5:2 Rule: Fasting days are 25% of TDEE (or typically 500-600kcal)
    // We will use 25% or capped at 600 for safety in general advice, but let's stick to the 500/600 rule adjusted for body size
    // Modern 5:2 (Michael Mosley's updated "Fast 800") allows 800. Let's stick to traditional 25% TDEE for calc.
    const fastingCalories = Math.round(tdee * 0.25);

    const bmi = values.weight / Math.pow(values.height / 100, 2);

    const schedule = DAYS_OF_WEEK.map(d => {
      const isFasting = values.fastingDays.includes(d.id);
      return {
        day: d.id,
        type: isFasting ? 'Fast' : 'Feed',
        calories: isFasting ? fastingCalories : tdee,
        macroFocus: isFasting ? 'High Protein, Veggies' : 'Balanced Macros'
      };
    });

    const weeklyMaintenance = tdee * 7;
    const weeklyActual = schedule.reduce((acc, curr) => acc + curr.calories, 0);
    const weeklyDeficit = weeklyMaintenance - weeklyActual;
    const projectedWeightLoss = weeklyDeficit / 7700; // 7700kcal = 1kg fat roughly

    setResult({
      tdee,
      fastingCalories,
      weeklyDeficit,
      projectedWeightLoss, // in kg
      schedule,
      consecutiveWarning: checkConsecutive(values.fastingDays),
      interpretation: `Your estimated TDEE is ${tdee} kcal. By fasting on ${values.fastingDays.join(' & ')}, you create a weekly deficit of ${weeklyDeficit} kcal.`,
      bmi: parseFloat(bmi.toFixed(1)),
      bmiCategory: getBMICategory(bmi),
      insights: getInsights(weeklyDeficit, checkConsecutive(values.fastingDays)),
      risks: ['Risk of dehydration on fast days', 'Possible irritability (hanger)', 'Not suitable for eating disorder history']
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            5:2 Schedule Generator
          </CardTitle>
          <CardDescription>
            Calculate your custom fasting calories and visualize your weekly rhythm.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
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
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Years" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
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
                        <Input type="number" step="0.1" placeholder="kg" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
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
                        <Input type="number" placeholder="cm" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="activityLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select activity" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary (Desk job)</SelectItem>
                        <SelectItem value="light">Lightly Active (1-3 days/week)</SelectItem>
                        <SelectItem value="moderate">Moderately Active (3-5 days/week)</SelectItem>
                        <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                        <SelectItem value="very_active">Very Active (Physical job/training)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fastingDays"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Select 2 Fasting Days</FormLabel>
                      <CardDescription>
                        Fasting days should ideally be non-consecutive (e.g. Mon & Thu).
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {DAYS_OF_WEEK.map((day) => (
                        <FormField
                          key={day.id}
                          control={form.control}
                          name="fastingDays"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={day.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(day.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, day.id])
                                        : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== day.id
                                          )
                                        )
                                    }}
                                    disabled={field.value?.length >= 2 && !field.value?.includes(day.id)}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {day.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                <Calendar className="mr-2 h-4 w-4" />
                Generate Schedule
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Utensils className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Your 5:2 Fasting Plan</CardTitle>
                  <CardDescription>Weekly calorie cycling structure</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="flex justify-center items-center gap-6 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Normal Days</p>
                    <p className="text-2xl font-bold text-primary">{result.tdee} kcal</p>
                  </div>
                  <div className="h-8 w-px bg-border"></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fasting Days</p>
                    <p className="text-2xl font-bold text-destructive">{result.fastingCalories} kcal</p>
                  </div>
                </div>
                <p className="text-muted-foreground">{result.interpretation}</p>
                {result.consecutiveWarning && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Warning: Consecutive fasting days selected. This increases the difficulty and hunger risk. Consider spacing them out (e.g., Mon/Thu).</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Flame className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                  <p className="font-semibold">Weekly Deficit</p>
                  <p className="text-lg font-bold">-{result.weeklyDeficit} kcal</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Activity className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Est. Weight Loss</p>
                  <p className="text-lg font-bold">~{result.projectedWeightLoss.toFixed(2)} kg/wk</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">BMI Status</p>
                  <Badge variant={result.bmiCategory === 'Normal weight' ? 'default' : result.bmiCategory === 'Obese' ? 'destructive' : 'secondary'}>
                    {result.bmiCategory} ({result.bmi})
                  </Badge>
                </div>
              </div>

              {/* Day Grid */}
              <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
                {result.schedule.map((day) => (
                  <div key={day.day} className={`p-3 rounded-lg border text-center ${day.type === 'Fast' ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20' : 'bg-card'}`}>
                    <p className="font-semibold text-sm mb-1">{day.day}</p>
                    <Badge variant={day.type === 'Fast' ? 'destructive' : 'secondary'} className="mb-2 uppercase text-[10px]">
                      {day.type}
                    </Badge>
                    <p className="text-xs text-muted-foreground font-mono">{day.calories} kcal</p>
                  </div>
                ))}
              </div>

            </CardContent>
          </Card>

          {/* Strategic Insights & Risk Assessment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Target className="h-6 w-6" />
                  Strategic Insights
                </CardTitle>
                <CardDescription>Optimizing your fast</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm font-medium">{insight}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="h-full border-red-100 bg-red-50/10 dark:border-red-900/20 dark:bg-red-900/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-400">
                  <AlertCircle className="h-6 w-6" />
                  Risk Assessment
                </CardTitle>
                <CardDescription>Contraindications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.risks.map((risk, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">{risk}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Understanding Inputs */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
          <CardDescription>
            Core components of the 5:2 Diet Calculation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Utensils className="h-4 w-4" />
                The "5" Days (Feast)
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Days where you eat normally (at TDEE maintenance level).
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>No calorie restriction required, but no binging.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Focus on nutrient density to support fasting days.</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <Clock className="h-4 w-4" />
                The "2" Days (Fast)
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Two days per week restricted to ~25% of energy needs.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Typically 500 kcal for women, 600 kcal for men.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Triggers metabolic repair mechanisms (autophagy).</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formula Used */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            The 5:2 Deficit Formula
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              Weekly Deficit = (TDEE × 2) - (Fasting Calories × 2)
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Instead of a small daily deficit (like -500kcal/day), the 5:2 diet creates a large weekly deficit (~3000-4000kcal) through two separate events, allowing for "normalcy" the rest of the week.
          </p>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Nutrition Tools
          </CardTitle>
          <CardDescription>
            Optimize your weight loss strategy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/health-fitness/intermittent-fasting-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">16:8 Fasting</p>
                      <p className="text-sm text-muted-foreground">Daily TRT Window</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/health-fitness/macro-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Utensils className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Macro Ratio Calc</p>
                      <p className="text-sm text-muted-foreground">Protein/Carb/Fat Split</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/health-fitness/keto-macro-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Flame className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Keto Calculator</p>
                      <p className="text-sm text-muted-foreground">Low Carb Analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/health-fitness/bmr-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">BMR Calculator</p>
                      <p className="text-sm text-muted-foreground">Basal Metabolic Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/health-fitness/hydration-needs-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="h-5 w-5 text-cyan-600" />
                    <div>
                      <p className="font-medium">Water Intake</p>
                      <p className="text-sm text-muted-foreground">Hydration Goals</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/health-fitness/protein-intake-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Protein Calculator</p>
                      <p className="text-sm text-muted-foreground">Muscle Retention</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide Section */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="The Ultimate Guide to the 5:2 Diet: Schedule, Benefits, and Meal Plans" />
        <meta itemProp="description" content="Master the popular 5:2 Intermittent Fasting schedule. Learn how to calculate your 500-600 calorie limits, choose the best fasting days, and activate autophagy benefits without giving up your favorite foods." />
        <meta itemProp="author" content="MegaCalc Health Team" />
        <meta itemProp="datePublished" content="2025-02-18" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">The Definitive Guide to the 5:2 Diet: Intermittent Fasting Made Simple</h1>
        <p className="text-lg italic text-muted-foreground">
          Known as "The Fast Diet," the 5:2 protocol revolutionizes weight loss by asking for discipline only two days a week, offering metabolic flexibility and freedom for the other five.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#whatis" className="hover:underline">What is the 5:2 Diet?</a></li>
          <li><a href="#benefits" className="hover:underline">The Science: Autophagy and Insulin Sensitivity</a></li>
          <li><a href="#schedule" className="hover:underline">Choosing Your Two Days: The Scheduling Strategy</a></li>
          <li><a href="#calories" className="hover:underline">Calories: The 500/600 Rule vs. 25% Rule</a></li>
          <li><a href="#risks" className="hover:underline">Who Should Avoid 5:2?</a></li>
        </ul>
        <hr className="my-6" />

        <h2 id="whatis" className="text-2xl font-bold text-foreground pt-6">What is the 5:2 Diet?</h2>
        <p>
          The 5:2 diet is a form of intermittent fasting popularized by Dr. Michael Mosley. Unlike daily time-restricted eating (like 16:8), the 5:2 diet focuses on weekly calorie cycling.
        </p>
        <p className="mt-4">
          The premise is simple:
        </p>
        <ul className="list-disc ml-6 space-y-2 mt-2">
          <li><strong>5 Days a Week:</strong> Eat normally. No calorie counting, no forbidden food groups (though healthy choices are encouraged).</li>
          <li><strong>2 Days a Week:</strong> Restrict calorie intake effectively to 500 calories for women and 600 calories for men (or roughly 25% of TDEE).</li>
        </ul>
        <p className="mt-4">
          These two days are not "zero calorie" water fasts. You are allowed to eat, but the quantity is small enough to trigger fasting mimicry responses in the body.
        </p>

        <h2 id="benefits" className="text-2xl font-bold text-foreground pt-8">The Science: Autophagy and Insulin Sensitivity</h2>
        <p>
          Why torture yourself for two days? The benefits extend far beyond simple calorie reduction.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">1. Autophagy ("Self-Eating")</h3>
        <p>
          When energy coming in from food is low, the body switches from "growth mode" to "repair mode." Cells begin to break down and recycle old, damaged proteins and organelles. This process, called autophagy, is linked to longevity, reduced inflammation, and protection against neurodegenerative diseases.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">2. Insulin Sensitivity</h3>
        <p>
          Frequent eating keeps insulin levels chronically high, leading to insulin resistance (Pre-Diabetes). The two fasting days allow insulin levels to drop significantly, resensitizing the body's cells to insulin. This makes fat burning easier and helps regulate blood sugar.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">3. Visceral Fat Loss</h3>
        <p>
          Studies show that intermittent fasting is particularly effective at targeting visceral fat—the dangerous fat stored around internal organs—while preserving lean muscle mass better than chronic steady-state calorie restriction.
        </p>

        <h2 id="schedule" className="text-2xl font-bold text-foreground pt-8">Choosing Your Two Days: The Scheduling Strategy</h2>
        <p>
          The beauty of 5:2 is flexibility, but consistency helps habit formation.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The "Split" Protocol (Recommended)</h3>
        <p>
          Most practitioners recommend splitting the fasting days, such as <strong>Monday and Thursday</strong>.
        </p>
        <ul className="list-disc ml-6 space-y-2 mt-2">
          <li><strong>Monday:</strong> A great "reset" after a potentially indulgent weekend.</li>
          <li><strong>Thursday:</strong> Clears the system before the upcoming weekend.</li>
        </ul>
        <p className="mt-4">
          Splitting the days prevents the extreme hunger and fatigue associated with 48-hour continuous fasting. It gives you a "light at the end of the tunnel"—you only have to get through <em>today</em> before you can eat normally tomorrow.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The "Consecutive" Protocol (Advanced)</h3>
        <p>
          Some advanced fasters choose consecutive days (e.g., Monday and Tuesday). This creates a longer continuous window of low insulin, which may deepen ketosis and autophagy. However, the second day is often psychologically difficult, and energy levels for work/training may plummet.
        </p>

        <h2 id="calories" className="text-2xl font-bold text-foreground pt-8">Calories: The 500/600 Rule vs. 25% Rule</h2>
        <p>
          Original guidelines were strict: 500kcal for women, 600kcal for men.
        </p>
        <p className="mt-4">
          However, a 6ft 5in male athlete needs more energy than a 5ft 2in sedentary male. Therefore, the <strong>25% of TDEE rule</strong> is often more accurate.
        </p>
        <p className="mt-4">
          <strong>What does 500 calories look like?</strong>
        </p>
        <ul className="list-disc ml-6 space-y-2 mt-2">
          <li><strong>Breakfast:</strong> Black coffee (0), Two boiled eggs (140) = 140 kcal.</li>
          <li><strong>Lunch:</strong> Skip (Water/Tea).</li>
          <li><strong>Dinner:</strong> Grilled chicken breast (150g) with steamed broccoli and zucchini = ~350 kcal.</li>
          <li><strong>Total:</strong> ~490 kcal.</li>
        </ul>
        <p className="mt-4">
          Focus on high-volume, low-calorie foods (leafy greens) and satiating protein. Avoid simple carbs (bread, pasta) on fasting days, as they spike insulin and trigger hunger pangs.
        </p>

        <h2 id="risks" className="text-2xl font-bold text-foreground pt-8">Who Should Avoid 5:2?</h2>
        <p>
          Intermittent fasting is a stressor. While "hormetic" (good) stress for healthy individuals, it can be harmful for others.
        </p>
        <div className="p-4 bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 my-6">
          <h4 className="font-bold text-red-700 dark:text-red-400">Contraindications</h4>
          <ul className="list-disc ml-6 mt-2 text-red-600 dark:text-red-300">
            <li>Pregnant or breastfeeding women (high nutrient needs).</li>
            <li>Individuals with a history of Anorexia, Bulimia, or Binge Eating Disorder (fasting can trigger relapse).</li>
            <li>Type 1 Diabetics or Type 2 on insulin (high risk of hypoglycemia).</li>
            <li>Children and teenagers (growth phase).</li>
          </ul>
        </div>
      </section>

      {/* FAQ Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Solutions to common 5:2 challenges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-2">Can I exercise on fasting days?</h4>
              <p className="text-muted-foreground">
                Yes, but keep intensity low. Walking, yoga, or light Pilates is excellent. Heavy weightlifting or HIIT sprints are best saved for "feed" days when you have glycogen stores to fuel the effort and protein to repair the damage.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-2">What can I drink on fasting days?</h4>
              <p className="text-muted-foreground">
                Water, black coffee, and tea (green/herbal) are unrestricted. Avoid sugary drinks, alcohol, and milky lattes. Some protocols allow a splash of milk in tea, but technically anything with calories breaks the fasted state. Bone broth is a popular "crutch" as it provides electrolytes and savory flavor for very few calories.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-2">Will I lose muscle mass?</h4>
              <p className="text-muted-foreground">
                Generally, no, as long as you eat enough protein on your 5 normal days and perform resistance training. Intermittent fasting actually boosts Growth Hormone (HGH), which helps preserve lean tissue. However, if your <em>weekly</em> protein intake drops too low, muscle loss is possible.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-2">Can I save up my calories for one meal?</h4>
              <p className="text-muted-foreground">
                Yes! Many people find it easier to skip breakfast and lunch, saving their entire 500-600 calorie allowance for a decent dinner. This is effectively OMAD (One Meal A Day) twice a week. It reduces the window of "thinking about food."
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-2">What if I feel dizzy or faint?</h4>
              <p className="text-muted-foreground">
                Break the fast immediately. Dizziness often indicates low blood sugar or low electrolytes (sodium). Eat a small snack. It takes time for the body to become "metabolically flexible" (efficient at burning fat for fuel). Don't force it if you feel unwell.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-2">Does the 5:2 diet slow down metabolism?</h4>
              <p className="text-muted-foreground">
                Contrary to popular belief, short-term fasting actually <em>increases</em> metabolic rate (due to norepinephrine release). Chronic, long-term calorie restriction (eating 1200 calories <em>every</em> day) is what typically downregulates metabolism ("starvation mode"). 5:2 avoids this by having 5 days of normal eating.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-2">How fast will I lose weight?</h4>
              <p className="text-muted-foreground">
                Most people lose about 0.5kg to 1kg (1-2 lbs) per week. This is considered a safe and sustainable rate. Weight loss may be rapid in the first week due to water weight (glycogen depletion).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-2">Can I do 4:3 instead?</h4>
              <p className="text-muted-foreground">
                Yes, this is called Alternate Day Fasting (ADF). It is more aggressive and yields faster results but is harder to sustain socially. 5:2 is generally considered the "sweet spot" for sustainability.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-2">Do I have to count calories on non-fasting days?</h4>
              <p className="text-muted-foreground">
                Technically, no. the idea is to eat "normally." However, if you binge eat 4000 calories on normal days to "make up" for the fast, you will negate the deficit. Eating intuitively to satiety usually works best.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-2">Is it normal to have a headache?</h4>
              <p className="text-muted-foreground">
                "Fasting headaches" are common in the first few weeks. They are usually caused by dehydration or withdrawal from sugar/caffeine. Ensure you drink plenty of water and perhaps add a pinch of salt to your water.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage of this Calculator */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Usage of this Calculator
          </CardTitle>
          <CardDescription>
            Practical applications and real-world context
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Who should use */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Users className="h-5 w-5 text-blue-600" />
              Who Should Use This Calculator?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Busy Professionals</strong>
                <span className="text-sm text-muted-foreground">Who struggle with daily meal prep but can manage two disciplined days to free up their schedule ("work through lunch").</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Social Eaters</strong>
                <span className="text-sm text-muted-foreground">People who enjoy dinners out on weekends. This method allows you to "bank" calories during the week to enjoy the weekend guilt-free.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Plateau Breakers</strong>
                <span className="text-sm text-muted-foreground">Individuals whose weight loss has stalled on standard low-calorie diets. The "calorie cycling" can help reset leptin levels and metabolism.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Longevity Seekers</strong>
                <span className="text-sm text-muted-foreground">Those focused on autophagy (cellular repair) and insulin sensitivity rather than just weight scale numbers.</span>
              </div>
            </div>
          </div>

          <hr className="border-border/50" />

          {/* When it might be inaccurate */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Limitations & Accuracy nuances
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Individual TDEE Variance:</strong> The calculator uses Mifflin-St Jeor, which is an estimate. Your actual maintenance metabolism may vary by +/- 200 kcals due to genetics and NEAT (muscle fidgeting).</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>The "Licensing Effect":</strong> Some users subconsciously overeat by 10-20% on non-fasting days because they feel they "earned" it, which can accidentally close the deficit gap.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Activity Fluctuations:</strong> If you are highly active on fasting days, the standard 500/600 kcal limit might be dangerously low. You may need to add a small protein snack post-workout.</span>
              </li>
            </ul>
          </div>

          <hr className="border-border/50" />

          {/* Real World Examples */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Landmark className="h-5 w-5 text-green-600" />
              Real-World Examples
            </h4>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Case A: The "Monday-Thursday" Split</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  Sarah (70kg) eats 2000kcal 5 days a week. On Mon/Thu, she skips breakfast/lunch and eats a 500kcal dinner. Result: Weekly deficit of 3000kcal (~0.4kg loss/week) with minimal social disruption.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Case B: The "Fast 800" Modification</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                  Mark finds 600kcal too hard. He modifies 5:2 to allow 800kcal (high protein, low carb) on fasting days. His deficit is slightly smaller, but his adherence is 100%, leading to better long-term results than failing on a stricter plan.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The 5:2 Schedule Calculator helps plan your weekly intermittent fasting routine by establishing your TDEE and safe fasting calorie limits.</p>
          <p>It provides a clear visual structure for calorie cycling, allowing for significant weekly deficits without daily deprivation.</p>
          <p>Use this tool to customize your fasting days (e.g., Mon/Thu) and ensure your fasting calorie intake is safe and effective for your body size.</p>
        </CardContent>
      </Card>

    </div>
  );
}
