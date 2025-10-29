'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Info, Target, BarChart3, HelpCircle } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  bodyWeight: z.number().positive(),
  bodyFatPercentage: z.number().positive().max(100),
  unit: z.enum(['kg', 'lbs']),
});

type FormValues = z.infer<typeof formSchema>;

export default function LeanBodyMassCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'kg',
    },
  });

  const onSubmit = (values: FormValues) => {
    const fatMass = values.bodyWeight * (values.bodyFatPercentage / 100);
    const lbm = values.bodyWeight - fatMass;
    setResult(lbm);
  };
  
  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Calculate Your Lean Body Mass
          </CardTitle>
          <CardDescription>
            Determine your lean body mass using your total weight and body fat percentage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="unit" render={({ field }) => (
                    <FormItem><FormLabel>Units</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="kg">Kilograms (kg)</SelectItem><SelectItem value="lbs">Pounds (lbs)</SelectItem></SelectContent></Select></FormItem>
                )} />
                <FormField control={form.control} name="bodyWeight" render={({ field }) => (<FormItem><FormLabel>Total Body Weight ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="bodyFatPercentage" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                        <FormLabel>Body Fat Percentage (%)</FormLabel>
                        <FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl>
                        <FormDescription>
                            Need to find this? Use the <Link href="/category/health-fitness/body-fat-percentage-calculator" className="text-primary underline">Body Fat Percentage Calculator</Link>.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />
              </div>
              <Button type="submit">Calculate LBM</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      {result && (
        <Card>
            <CardHeader>
              <div className='flex items-center gap-4'>
                <Dumbbell className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Lean Body Mass (LBM)</CardTitle>
                  <CardDescription>Estimated lean tissue weight</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.toFixed(1)} {unit}</p>
                    <CardDescription>This is the weight of your muscles, bones, organs, and water.</CardDescription>
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
              <h4 className="font-semibold text-foreground mb-2">Total Body Weight</h4>
              <p className="text-muted-foreground">
                Your current total body weight in either kilograms or pounds. This should be your most recent measurement, ideally taken at the same time of day (morning before eating is ideal) for consistency.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Body Fat Percentage</h4>
              <p className="text-muted-foreground">
                This is the percentage of your total weight that consists of fat tissue. You can determine this using various methods: DEXA scans (most accurate), bioelectrical impedance (BIA) scales, calipers, or body measurements. If you don't know your body fat percentage, you can use our Body Fat Percentage Calculator to get an estimate.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">The Calculation</h4>
              <p className="text-muted-foreground">
                Lean Body Mass = Total Body Weight - Fat Mass, where Fat Mass = Body Weight × (Body Fat % / 100). The result represents everything in your body that isn't fat: muscle, bone, organs, water, and connective tissues.
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
              Explore other body composition and health calculators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/body-fat-percentage-calculator" className="text-primary hover:underline">
                    Body Fat Percentage Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate your body fat percentage to use as input for lean body mass calculation.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/bmi-calculator" className="text-primary hover:underline">
                    BMI Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Understand your body mass index alongside your lean body mass.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/bmr-calculator" className="text-primary hover:underline">
                    BMR Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate your basal metabolic rate, which is directly influenced by lean body mass.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary hover:underline">
                    Daily Calorie Needs Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Determine your total daily energy expenditure based on your body composition.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/protein-intake-calculator" className="text-primary hover:underline">
                    Protein Intake Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate optimal protein intake to support and build lean body mass.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/ideal-body-weight-calculator" className="text-primary hover:underline">
                    Ideal Body Weight Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Find your ideal weight range considering your lean body mass.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              Complete Guide to Lean Body Mass
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h2 className="text-xl font-bold text-foreground">Lean Body Mass Calculator: Understand Your True Body Composition</h2>
            <p>Lean Body Mass (LBM) represents everything in your body that isn't fat — including muscle, bones, water, organs, and
              connective tissues. It's one of the most important indicators of metabolic health, athletic performance, and long-term
              vitality. This guide explains how lean body mass is calculated, what it means for your goals, and how to improve it
              safely and effectively.</p>

            <h3 className="font-semibold text-foreground mt-6">💡 What Is Lean Body Mass?</h3>
            <p>Lean body mass is the total weight of your body minus all fat mass. It includes muscle tissue, bone density, body
              water, organs, and skin. It's often confused with muscle mass — but LBM is broader and more comprehensive.</p>
            <p>For example, if you weigh 75 kg and have 15 kg of body fat, your lean body mass is 60 kg.  
              This number is crucial because it directly influences your <strong>basal metabolic rate (BMR)</strong> — the amount
              of energy your body burns at rest.</p>

            <h3 className="font-semibold text-foreground mt-6">⚙️ How Lean Body Mass Is Calculated</h3>
            <p>The calculator uses validated formulas based on research and anthropometric data. Here are the two most commonly used
              methods:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Boer Formula:</strong> For men: LBM = (0.407 × weight in kg) + (0.267 × height in cm) − 19.2. For women: LBM = (0.252 × weight in kg) + (0.473 × height in cm) − 48.3</li>
              <li><strong>James Formula:</strong> For men: LBM = 1.1 × weight − 128 × (weight² / height²). For women: LBM = 1.07 × weight − 148 × (weight² / height²)</li>
            </ul>
            <p>These formulas are highly reliable for estimating lean mass in the general population, especially when body fat
              measurement tools (like DEXA or BIA) are unavailable.</p>

            <h3 className="font-semibold text-foreground mt-6">📊 Typical Lean Body Mass Ranges</h3>
            <p>Healthy LBM values depend on sex, height, fitness level, and age. Generally, a higher lean mass relative to total
              weight indicates better metabolic health.</p>
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-gray-200 dark:border-gray-700 text-sm">
                <thead>
                  <tr className="bg-muted text-left">
                    <th className="border p-2">Category</th>
                    <th className="border p-2">Men (Lean Mass %)</th>
                    <th className="border p-2">Women (Lean Mass %)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2">Athletes</td>
                    <td className="border p-2">85–90%</td>
                    <td className="border p-2">78–85%</td>
                  </tr>
                  <tr>
                    <td className="border p-2">Fit Individuals</td>
                    <td className="border p-2">80–85%</td>
                    <td className="border p-2">74–78%</td>
                  </tr>
                  <tr>
                    <td className="border p-2">Average Adults</td>
                    <td className="border p-2">70–80%</td>
                    <td className="border p-2">65–75%</td>
                  </tr>
                  <tr>
                    <td className="border p-2">Low Muscle Mass</td>
                    <td className="border p-2">Below 70%</td>
                    <td className="border p-2">Below 65%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="font-semibold text-foreground mt-6">🔥 Why Lean Body Mass Matters</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Higher metabolism:</strong> Muscle burns more calories than fat, even at rest, increasing daily energy expenditure.</li>
              <li><strong>Improved strength and mobility:</strong> Greater lean mass supports better posture, joint protection, and athletic performance.</li>
              <li><strong>Better glucose regulation:</strong> Muscle tissue acts as a storage site for glucose, improving insulin sensitivity and reducing diabetes risk.</li>
              <li><strong>Enhanced longevity:</strong> Studies show that maintaining lean mass lowers the risk of frailty and chronic diseases with age.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">🧬 Lean Body Mass vs. Muscle Mass</h3>
            <p>While both terms are often used interchangeably, there's a subtle difference:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Lean Body Mass:</strong> Includes muscle, bones, organs, and water.</li>
              <li><strong>Muscle Mass:</strong> Refers only to skeletal muscles attached to bones that control movement.</li>
            </ul>
            <p>Thus, lean body mass is always slightly higher than muscle mass. When you build muscle or reduce body fat, your LBM improves.</p>

            <h3 className="font-semibold text-foreground mt-6">📉 How to Increase Lean Body Mass Naturally</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Progressive strength training:</strong> Lift weights 3–5 times weekly, increasing resistance gradually.</li>
              <li><strong>Consume enough protein:</strong> Aim for 1.6–2.2 g of protein per kilogram of body weight per day.</li>
              <li><strong>Eat a mild calorie surplus:</strong> A 200–300 kcal/day surplus helps fuel muscle growth without excess fat gain.</li>
              <li><strong>Prioritize sleep:</strong> 7–9 hours per night supports muscle recovery and anabolic hormone release.</li>
              <li><strong>Stay hydrated:</strong> Water is part of lean tissue — dehydration lowers your apparent LBM.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">🥗 Nutrition Tips for Lean Mass Development</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Focus on high-quality proteins (chicken, fish, eggs, soy, legumes).</li>
              <li>Include complex carbs (oats, quinoa, brown rice) for workout fuel.</li>
              <li>Don't fear healthy fats — omega-3s support hormone balance.</li>
              <li>Eat every 3–4 hours to maintain amino acid supply for repair.</li>
              <li>Post-workout meals should combine carbs + protein for recovery.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">⚖️ How Lean Body Mass Impacts BMR and Weight Management</h3>
            <p>Your <strong>Basal Metabolic Rate (BMR)</strong> is largely determined by lean mass. Every kilogram of muscle burns
              roughly 13–20 calories per day at rest, while fat burns only about 4–5.  
              Increasing LBM therefore raises your metabolism, making fat loss easier and maintenance more stable.</p>

            <h3 className="font-semibold text-foreground mt-6">🧠 Why Knowing Your LBM Helps You Train Smarter</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>It allows accurate calorie and protein targeting for fitness goals.</li>
              <li>It helps distinguish between fat loss and muscle loss during cutting phases.</li>
              <li>It guides your ideal body weight estimation more effectively than BMI.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">🩺 How Aging Affects Lean Body Mass</h3>
            <p>After age 30, individuals lose 3–8% of muscle mass per decade, a condition known as <strong> sarcopenia</strong>.  
              Regular resistance exercise and adequate protein intake can slow or even reverse this process, preserving metabolic
              health and independence in later years.</p>

            <h3 className="font-semibold text-foreground mt-6">🧩 Tracking Your Progress Over Time</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Measure LBM every 4–6 weeks for meaningful trends.</li>
              <li>Pair with body fat measurements for complete composition tracking.</li>
              <li>Take progress photos or note strength improvements — visual and functional feedback matter more than the scale.</li>
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
              Common questions about lean body mass and body composition
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What's a healthy lean body mass percentage?</h4>
              <p className="text-muted-foreground">
                Generally, men should have 80–90% LBM, and women 70–85%, depending on activity level. Athletes typically fall in the higher ranges (85-90% for men, 78-85% for women), while average adults are often in the 70-85% range (men) or 65-75% range (women). These percentages vary based on genetics, age, and training history.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Is lean body mass the same as fat-free mass?</h4>
              <p className="text-muted-foreground">
                Nearly — the difference is minimal. Lean mass includes a small portion of essential fat present in organs and nervous system tissue. Fat-free mass technically excludes all fat, including essential fat. For practical purposes, they're often used interchangeably, but lean body mass is slightly more accurate as it accounts for the essential fat needed for normal body function.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I build lean mass while losing fat?</h4>
              <p className="text-muted-foreground">
                Yes, with proper nutrition, resistance training, and adequate protein, you can recomposition — lose fat while gaining lean tissue. This is most common in beginners, those returning to training after a break, or those using a small calorie deficit (200-500 calories). Advanced lifters may find it more challenging and may need to alternate between cutting and bulking phases.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Does cardio reduce lean body mass?</h4>
              <p className="text-muted-foreground">
                Excessive endurance training without sufficient calories or protein may cause muscle loss. However, balanced cardio enhances fat loss without harming LBM when combined with resistance training and adequate nutrition. The key is ensuring you're eating enough protein and calories to support recovery. Moderate cardio (150 minutes/week) typically preserves or even slightly improves LBM when paired with strength training.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the best way to measure lean body mass accurately?</h4>
              <p className="text-muted-foreground">
                DEXA scans are most precise, followed by BIA scales and anthropometric formulas like the ones used in this calculator. DEXA (Dual-Energy X-ray Absorptiometry) is considered the gold standard, providing detailed breakdowns of fat mass, lean mass, and bone density. BIA devices are more accessible but less accurate. The formula-based methods used here provide good estimates for most people.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How does hydration affect lean body mass measurements?</h4>
              <p className="text-muted-foreground">
                Water is a component of lean body mass, so hydration status can affect measurements. Dehydration can make LBM appear lower than it actually is, while overhydration can inflate it slightly. For consistency, measure at the same time of day and maintain similar hydration levels. Morning measurements, before eating or drinking much, tend to be most consistent.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Why do I need to know my lean body mass?</h4>
              <p className="text-muted-foreground">
                Knowing your LBM helps you set more accurate calorie and protein targets, understand your metabolism better, and track meaningful body composition changes (not just scale weight). It's particularly useful for calculating protein needs (often based on LBM or target bodyweight), estimating calorie needs more precisely, and distinguishing between fat loss and muscle loss during weight loss phases.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can women build as much lean mass as men?</h4>
              <p className="text-muted-foreground">
                Women can build significant lean mass, but generally have lower absolute amounts than men due to hormonal differences and typically smaller body size. However, relative to their starting point, women can achieve similar percentage gains in muscle mass with proper training and nutrition. Women naturally have higher body fat percentages due to reproductive needs, so their LBM percentages are typically lower than men's, but that doesn't mean they can't improve it significantly.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How long does it take to increase lean body mass?</h4>
              <p className="text-muted-foreground">
                Beginner lifters can see noticeable increases in 2-3 months with proper training and nutrition. Intermediate lifters might gain 2-5 pounds of lean mass per year, while advanced lifters may gain 1-2 pounds per year or less. Muscle growth is a slow process—realistic expectations are important. Focus on consistent training, adequate protein, and sufficient calories, then track progress over months and years, not weeks.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Will my lean body mass decrease if I lose weight?</h4>
              <p className="text-muted-foreground">
                It depends on how you lose weight. With proper resistance training and high protein intake, you can preserve most lean mass while losing fat. However, aggressive dieting without strength training or adequate protein will result in significant muscle loss along with fat loss. The goal during weight loss should be to maximize fat loss while minimizing lean mass loss, which requires strategic nutrition and exercise.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
