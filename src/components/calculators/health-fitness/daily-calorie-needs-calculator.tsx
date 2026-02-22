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
import { Flame, Info, Target, Activity, Users, BarChart3, HelpCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const formSchema = z.object({
  age: z.number().positive().int(),
  gender: z.enum(['male', 'female']),
  weight: z.number().positive(),
  height: z.number().positive(),
  unit: z.enum(['metric', 'imperial']),
  activityLevel: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

const activityLevels = [
  { name: 'Sedentary', description: 'Little or no exercise', multiplier: 1.2 },
  { name: 'Lightly Active', description: 'Light exercise (1-3 days/week)', multiplier: 1.375 },
  { name: 'Moderately Active', description: 'Moderate exercise (3-5 days/week)', multiplier: 1.55 },
  { name: 'Very Active', description: 'Hard exercise (6-7 days/week)', multiplier: 1.725 },
  { name: 'Extra Active', description: 'Very hard exercise & physical job', multiplier: 1.9 },
];

export default function DailyCalorieNeedsCalculator() {
  const [result, setResult] = useState<{ tdee: number, bmr: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'metric',
      age: undefined,
      gender: 'male',
      weight: undefined,
      height: undefined,
      activityLevel: '1.375',
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

    const tdee = bmr * parseFloat(values.activityLevel);

    setResult({ tdee, bmr });
  };

  const unit = form.watch('unit');

  const chartData = result ? activityLevels.map(level => ({
    name: level.name,
    calories: Math.round(result.bmr * level.multiplier),
    description: level.description,
  })) : [];

  return (
    <div className="space-y-8">
      {/* SEO-Optimized Header */}
      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold">Daily Calorie Needs Calculator (TDEE)</h1>
        <p className="text-lg text-muted-foreground">
          Scientifically estimate your Total Daily Energy Expenditure to lose, gain, or maintain weight effectively.
        </p>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Calculate Your Daily Calorie Needs
          </CardTitle>
          <CardDescription>
            Enter your details to get a personalized estimate of your daily caloric burn.
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
                <FormField control={form.control} name="activityLevel" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {activityLevels.map(level => (
                          <SelectItem key={level.name} value={String(level.multiplier)}>{level.name} ({level.description})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate TDEE</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className='flex items-center gap-4'>
              <div className="p-3 bg-primary rounded-full text-primary-foreground">
                <Flame className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>Your Daily Calorie Needs</CardTitle>
                <CardDescription>Based on the Mifflin-St Jeor Equation</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="text-center space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide font-semibold">Maintenance Calories (TDEE)</p>
                  <p className="text-5xl font-extrabold text-primary">{result.tdee.toFixed(0)} <span className="text-xl text-muted-foreground font-normal">kcal/day</span></p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-3 bg-background rounded-lg border">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Weight Loss (-500)</p>
                    <p className="text-xl font-bold text-green-600">{(result.tdee - 500).toFixed(0)}</p>
                  </div>
                  <div className="p-3 bg-background rounded-lg border">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Weight Gain (+500)</p>
                    <p className="text-xl font-bold text-orange-600">{(result.tdee + 500).toFixed(0)}</p>
                  </div>
                </div>

                <div className="p-4 bg-background/50 rounded-lg text-left text-sm border">
                  <div className="flex justify-between items-center mb-1">
                    <span>Basal Metabolic Rate (BMR)</span>
                    <span className="font-semibold">{result.bmr.toFixed(0)} kcal</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Calories burned at complete rest.</p>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-popover border p-3 rounded-lg shadow-lg">
                              <p className="font-bold mb-1">{payload[0].payload.name}</p>
                              <p className='text-xs text-muted-foreground mb-2'>{payload[0].payload.description}</p>
                              <p className="text-primary font-bold">{`${payload[0].value} Calories`}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="calories" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-xs text-muted-foreground mt-2">Daily calorie needs across different activity levels</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Understanding the Inputs Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Metrics
          </CardTitle>
          <CardDescription>
            Key factors that influence your energy expenditure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Activity className="h-4 w-4" />
                BMR (Basal Metabolic Rate)
              </h4>
              <p className="text-sm text-muted-foreground">
                The number of calories your body burns performing basic life-sustaining functions like breathing, circulation, and cell production. This accounts for 60-75% of your total burn.
              </p>
            </div>

            <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-orange-700 dark:text-orange-300">
                <Flame className="h-4 w-4" />
                TDEE (Total Expenditure)
              </h4>
              <p className="text-sm text-muted-foreground">
                Your total daily burn. It combines your BMR with calories burned through phsyical activity (exercise + daily movement) and the thermic effect of food.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guide Section */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-sm border" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="Complete Guide to Daily Calorie Needs (TDEE)" />
        <h2 className="text-2xl font-bold text-foreground">Complete Guide to Daily Calorie Needs</h2>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground">Why TDEE Matters</h3>
          <p>
            Your Total Daily Energy Expenditure (TDEE) is the most critical number for weight management. It acts as your nutritional "North Star."
          </p>
          <ul className="list-disc ml-5 space-y-2">
            <li><strong>To Lose Weight:</strong> You must eat <em>below</em> your TDEE (Calorie Deficit).</li>
            <li><strong>To Gain Weight:</strong> You must eat <em>above</em> your TDEE (Calorie Surplus).</li>
            <li><strong>To Maintain Weight:</strong> You must eat <em>at</em> your TDEE.</li>
          </ul>
        </div>

        <hr className="border-border/50 my-6" />

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground">The Equations We Use</h3>
          <p>
            This calculator uses the <strong>Mifflin-St Jeor equation</strong>, widely considered the most accurate standard for BMR calculation in clinical settings.
          </p>
          <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <p><strong>Men:</strong> (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5</p>
            <p className="mt-2"><strong>Women:</strong> (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161</p>
          </div>
          <p>
            Once BMR is calculated, we apply the Katch-McArdle activity multipliers to determine TDEE.
          </p>
        </div>

        <hr className="border-border/50 my-6" />

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground">Choosing the Right Activity Level</h3>
          <p>Most users overestimate their activity level. Be conservative relative to your choice.</p>
          <ul className="space-y-3 mt-4">
            <li className="flex gap-3">
              <span className="font-bold min-w-[140px]">Sedentary:</span>
              <span>Desk job, little to no exercise. (Most office workers fit here).</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold min-w-[140px]">Lightly Active:</span>
              <span>Light exercise/sports 1-3 days/week.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold min-w-[140px]">Moderately Active:</span>
              <span>Moderate exercise/sports 3-5 days/week.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold min-w-[140px]">Very Active:</span>
              <span>Hard exercise/sports 6-7 days/week.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Usage Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Who Should Use This?
          </CardTitle>
          <CardDescription>Real-world applications of TDEE</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-muted/20">
              <strong className="block mb-2 text-primary">Weight Watchers</strong>
              <p className="text-sm text-muted-foreground">Calculate your maintenance calories, then subtract 500 to find your "cut" calories for sustainable fat loss.</p>
            </div>
            <div className="p-4 border rounded-lg bg-muted/20">
              <strong className="block mb-2 text-primary">Bodybuilders</strong>
              <p className="text-sm text-muted-foreground">Find your baseline to ensure you are in a slight surplus (200-300 kcals) to maximize muscle growth without excess fat.</p>
            </div>
            <div className="p-4 border rounded-lg bg-muted/20">
              <strong className="block mb-2 text-primary">Athletes</strong>
              <p className="text-sm text-muted-foreground">Ensure you are fueling enough to support performance and recovery. Under-eating kills performance.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-foreground mb-2">How accurate is this calculator?</h4>
            <p className="text-muted-foreground">
              It is an estimate based on averages. Individual metabolism can vary by 10-15% due to genetics, muscle mass, and hormonal health. Use this as a starting point and adjust based on your real-world progress over 2-3 weeks.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Should I eat back my exercise calories?</h4>
            <p className="text-muted-foreground">
              Generally, no. The activity multiplier already accounts for your exercise. Adding exercise calories on top of your TDEE often leads to "double counting" and overeating.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Does muscle mass affect TDEE?</h4>
            <p className="text-muted-foreground">
              Yes! Muscle tissue burns more calories at rest than fat tissue. If you are very muscular, this calculator might slightly underestimate your needs.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">What happens if I eat below my BMR?</h4>
            <p className="text-muted-foreground">
              Consistently eating below your BMR is not recommended. It can lead to nutrient deficiencies, muscle loss, and metabolic adaptation (slowing down your metabolism).
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
            Explore other nutrition and fitness calculators to optimize your health journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/macro-ratio-calculator" className="text-primary hover:underline">
                  Macro Ratio Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate your optimal protein, carbs, and fat ratios based on your calorie needs.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/protein-intake-calculator" className="text-primary hover:underline">
                  Protein Intake Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Determine how much protein you need daily based on your body weight and fitness goals.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/carbohydrate-intake-calculator" className="text-primary hover:underline">
                  Carbohydrate Intake Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Find your optimal daily carbohydrate intake based on activity level and body weight.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/fat-intake-calculator" className="text-primary hover:underline">
                  Fat Intake Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate your daily fat requirements for optimal health and performance.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/bmr-calculator" className="text-primary hover:underline">
                  BMR Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate your Basal Metabolic Rate - the calories you burn at complete rest.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/body-fat-percentage-calculator" className="text-primary hover:underline">
                  Body Fat Percentage Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Track your body composition and understand your muscle-to-fat ratio.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
