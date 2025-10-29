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
import { Flame, Info, Target, BarChart3, HelpCircle, Users } from 'lucide-react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const formSchema = z.object({
  age: z.number().positive().int(),
  gender: z.enum(['male', 'female']),
  weight: z.number().positive(),
  height: z.number().positive(),
  unit: z.enum(['metric', 'imperial']),
});

type FormValues = z.infer<typeof formSchema>;

const activityLevels = [
    { name: 'Sedentary', description: 'Little or no exercise', multiplier: 1.2 },
    { name: 'Lightly Active', description: 'Light exercise (1-3 days/week)', multiplier: 1.375 },
    { name: 'Moderately Active', description: 'Moderate exercise (3-5 days/week)', multiplier: 1.55 },
    { name: 'Very Active', description: 'Hard exercise (6-7 days/week)', multiplier: 1.725 },
    { name: 'Extra Active', description: 'Very hard exercise & physical job', multiplier: 1.9 },
];

export default function BmrCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'metric',
      age: undefined,
      gender: 'male',
      weight: undefined,
      height: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { age, gender, unit } = values;
    let { weight, height } = values;

    if (unit === 'imperial') {
      weight *= 0.453592; // lbs to kg
      height *= 2.54;     // inches to cm
    }

    let bmr;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    setResult(bmr);
  };
  
  const unit = form.watch('unit');

  const chartData = result ? activityLevels.map(level => ({
      name: level.name,
      calories: Math.round(result * level.multiplier),
      description: level.description,
  })) : [];

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Calculate Your BMR
          </CardTitle>
          <CardDescription>
            Determine your Basal Metabolic Rate—the calories your body burns at complete rest
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="unit" render={({ field }) => (
                    <FormItem><FormLabel>Units</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="metric">Metric (kg, cm)</SelectItem><SelectItem value="imperial">Imperial (lbs, in)</SelectItem></SelectContent></Select></FormItem>
                )} />
                <FormField control={form.control} name="gender" render={({ field }) => (
                    <FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent></Select></FormItem>
                )} />
                <FormField control={form.control} name="age" render={({ field }) => (
                    <FormItem><FormLabel>Age (years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="weight" render={({ field }) => (
                    <FormItem><FormLabel>Weight ({unit === 'metric' ? 'kg' : 'lbs'})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="height" render={({ field }) => (
                    <FormItem><FormLabel>Height ({unit === 'metric' ? 'cm' : 'in'})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <Button type="submit">Calculate BMR</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      {result && (
        <Card>
            <CardHeader>
              <div className='flex items-center gap-4'>
                <Flame className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Your BMR Result</CardTitle>
                  <CardDescription>Basal Metabolic Rate estimate</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
                <div className="text-center space-y-2 mb-8">
                    <p className="text-4xl font-bold">{result.toFixed(0)}</p>
                    <CardDescription>Calories/day your body burns at rest.</CardDescription>
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">This represents the minimum calories needed for basic bodily functions when you're completely at rest—no movement, no digestion, just maintaining life.</p>
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-center mb-4">Daily Calorie Needs by Activity Level</h3>
                     <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} dy={10} />
                                <YAxis />
                                <Tooltip
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-background border p-2 rounded-lg shadow-lg">
                                                    <p className="font-bold">{label}</p>
                                                    <p className='text-sm text-muted-foreground'>{payload[0].payload.description}</p>
                                                    <p className="text-primary mt-1">{`Calories: ${payload[0].value}`}</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="calories" fill="hsl(var(--primary))" name="Estimated Daily Calories" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </CardContent>
        </Card>
      )}

      {/* Educational Content - Expanded Sections */}
      <div className="space-y-6">
        {/* Understanding the Inputs Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Understanding the Inputs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Age</h4>
              <p className="text-muted-foreground">
                Age is included because metabolism naturally slows with age, primarily due to loss of muscle mass (sarcopenia) and changes in hormone levels. The older you are, the lower your BMR tends to be, all else being equal. This is why maintaining muscle mass through strength training becomes increasingly important as you age.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Gender</h4>
              <p className="text-muted-foreground">
                Men typically have higher BMRs than women because they generally have more muscle mass and larger body size. The Mifflin-St Jeor equation uses different constants for men and women (+5 for men, -161 for women) to account for these biological differences in body composition and metabolic rates.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Weight and Height</h4>
              <p className="text-muted-foreground">
                Larger bodies require more energy to function. Weight and height are key factors because they determine your body's total size and surface area. The equation accounts for both because taller individuals have more surface area (affecting heat loss), and heavier individuals need more energy to maintain their mass.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">The Formula</h4>
              <p className="text-muted-foreground">
                The calculator uses the Mifflin-St Jeor equation, considered one of the most accurate BMR formulas. For men: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) + 5. For women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) - 161. This provides an estimate of your body's baseline energy needs.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Related Calculators Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Related Calculators
            </CardTitle>
            <CardDescription>
              Explore other metabolism and nutrition calculators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary hover:underline">
                    Daily Calorie Needs (TDEE)
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate your Total Daily Energy Expenditure by combining BMR with activity level.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/protein-intake-calculator" className="text-primary hover:underline">
                    Protein Intake Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Determine your optimal protein intake to support metabolism and muscle mass.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/fat-intake-calculator" className="text-primary hover:underline">
                    Fat Intake Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate your daily fat requirements for optimal health and energy.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/bmi-calculator" className="text-primary hover:underline">
                    BMI Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Understand your body mass index to complement your BMR knowledge.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5" />
              Complete Guide to BMR
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h2 className="text-xl font-bold text-foreground">What Is BMR?</h2>
            <p>Basal Metabolic Rate is the energy your body expends at rest to sustain vital functions: breathing, circulation, temperature regulation, and cellular maintenance.</p>

            <h3 className="font-semibold text-foreground mt-6">BMR vs RMR vs TDEE</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>BMR:</strong> strict, lab‑like resting conditions.</li>
              <li><strong>RMR:</strong> resting metabolic rate; similar but measured under less strict conditions—often slightly higher.</li>
              <li><strong>TDEE:</strong> total daily energy expenditure = RMR × activity + non‑exercise movement + thermic effect of food + exercise.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">What Changes Metabolism?</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Body mass and <strong>lean body mass</strong> (LBM)</li>
              <li>Age, sex, genetics, hormones</li>
              <li>Sleep, stress, medications, and chronic dieting history</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">Using Your Result</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Maintenance: calories ≈ TDEE.</li>
              <li>Fat loss: calories below TDEE; preserve protein and resistance training.</li>
              <li>Muscle gain: calories above TDEE with progressive overload.</li>
            </ul>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about BMR and metabolism
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between BMR and TDEE?</h4>
              <p className="text-muted-foreground">
                BMR is your Basal Metabolic Rate—the calories you burn at complete rest doing nothing. TDEE (Total Daily Energy Expenditure) includes BMR plus all other calories burned through daily activities, exercise, digestion (thermic effect of food), and non-exercise activity thermogenesis (NEAT). TDEE is what you use to determine how many calories to eat for weight maintenance, loss, or gain.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How accurate is the BMR calculation?</h4>
              <p className="text-muted-foreground">
                The Mifflin-St Jeor equation is considered one of the most accurate formulas for estimating BMR, with accuracy typically within 10% for most people. However, individual variations exist due to genetics, muscle mass, hormones, and other factors. For clinical precision, indirect calorimetry (measuring oxygen consumption) is used, but the formula provides excellent estimates for most purposes.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I increase my BMR?</h4>
              <p className="text-muted-foreground">
                Yes, through several strategies: build and maintain muscle mass through strength training (muscle burns more calories than fat), stay active throughout the day (NEAT), get adequate sleep, manage stress, and ensure proper nutrition. Building muscle is the most effective way to increase BMR because muscle tissue is metabolically active and burns calories even at rest.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Will my BMR decrease if I lose weight?</h4>
              <p className="text-muted-foreground">
                Yes, to some extent. As you lose weight, your body becomes smaller and requires less energy to maintain. However, if you lose weight primarily through fat loss while preserving muscle (via strength training and adequate protein), your BMR decrease will be minimized. If you lose significant muscle along with fat, your BMR will drop more substantially.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Is it safe to eat below my BMR?</h4>
              <p className="text-muted-foreground">
                Short-term eating slightly below BMR (especially if still eating above 90% of BMR) may be acceptable for weight loss, but consistently eating far below BMR (less than 80%) is not recommended and can slow metabolism, cause muscle loss, affect hormones, and reduce energy levels. It's generally better to create a modest calorie deficit (10-25% below TDEE, not BMR) while maintaining adequate protein and exercise.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Why is my BMR different from my friend's even though we're similar size?</h4>
              <p className="text-muted-foreground">
                Several factors beyond size affect BMR: body composition (muscle vs fat), age, hormones, genetics, sleep quality, stress levels, and medical conditions. Two people of the same weight and height can have significantly different BMRs if one has more muscle mass or different metabolic factors. This is why the formula is an estimate—individual metabolism varies.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How often should I recalculate my BMR?</h4>
              <p className="text-muted-foreground">
                Recalculate whenever your weight changes significantly (5-10 lbs) or when your body composition changes substantially (gained significant muscle or lost significant fat). For most people, recalculating every 3-6 months or after significant weight changes is appropriate. Age changes minimally year-to-year, so that's less critical unless you're recalculating after several years.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Does muscle really burn more calories than fat?</h4>
              <p className="text-muted-foreground">
                Yes. Muscle tissue is metabolically active and burns approximately 6-7 calories per pound per day at rest, while fat burns about 2 calories per pound. This means someone with more muscle mass will have a higher BMR than someone of the same weight with more fat. This is why strength training is so important for long-term metabolic health and weight management.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can medications affect my BMR?</h4>
              <p className="text-muted-foreground">
                Yes. Some medications can increase or decrease metabolism. For example, thyroid medications, certain antidepressants, beta-blockers, and steroids can affect metabolic rate. The BMR calculator doesn't account for medications, so if you're on medications that affect metabolism, your actual BMR might differ from the calculated value. Discuss with your healthcare provider if you suspect medications are affecting your metabolism.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Why do I need to know my BMR?</h4>
              <p className="text-muted-foreground">
                Understanding your BMR helps you calculate your TDEE and set appropriate calorie targets for your goals. It's the foundation for effective nutrition planning—whether you want to lose weight, gain weight, or maintain. You can't accurately determine how many calories you need without knowing your BMR first. It also helps you understand that a portion of your calorie needs is fixed (BMR) while another portion is variable based on activity.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
