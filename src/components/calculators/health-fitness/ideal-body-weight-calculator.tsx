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
import { Target, Info, Users, BarChart3, HelpCircle } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  sex: z.enum(['male', 'female']),
  heightFeet: z.number().int().positive().optional(),
  heightInches: z.number().int().nonnegative().optional(),
  heightCm: z.number().positive().optional(),
  unit: z.enum(['imperial', 'metric']),
}).refine(data => data.unit === 'metric' ? data.heightCm !== undefined : (data.heightFeet !== undefined && data.heightInches !== undefined), {
    message: "Height is required.",
    path: ["heightCm"],
});

type FormValues = z.infer<typeof formSchema>;

export default function IdealBodyWeightCalculator() {
  const [result, setResult] = useState<{ ibw: number; range: { min: number, max: number } } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sex: 'male',
      unit: 'imperial',
    },
  });

  const onSubmit = (values: FormValues) => {
    let heightInInches;
    if (values.unit === 'imperial') {
      heightInInches = (values.heightFeet || 0) * 12 + (values.heightInches || 0);
    } else {
      heightInInches = (values.heightCm || 0) / 2.54;
    }

    if (heightInInches <= 60) {
        form.setError("heightFeet", {message: "Height must be over 5 feet."});
        return;
    }

    const inchesOver5Feet = heightInInches - 60;
    let ibwKg;
    if (values.sex === 'male') {
      ibwKg = 48 + 2.7 * inchesOver5Feet;
    } else {
      ibwKg = 45.5 + 2.2 * inchesOver5Feet;
    }

    setResult({
        ibw: ibwKg,
        range: { min: ibwKg * 0.9, max: ibwKg * 1.1 }
    });
  };
  
  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Calculate Your Ideal Body Weight
          </CardTitle>
          <CardDescription>
            Determine your optimal weight range using the Hamwi formula based on height and gender
          </CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="sex" render={({ field }) => (
                <FormItem><FormLabel>Sex</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem><FormLabel>Units</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="imperial">Feet/Inches</SelectItem><SelectItem value="metric">Centimeters</SelectItem></SelectContent></Select></FormItem>
            )} />
            {unit === 'imperial' ? (
                <>
                <FormField control={form.control} name="heightFeet" render={({ field }) => (<FormItem><FormLabel>Height (ft)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="heightInches" render={({ field }) => (<FormItem><FormLabel>Height (in)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                </>
            ) : (
                <FormField control={form.control} name="heightCm" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Height (cm)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            )}
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
        </CardContent>
      </Card>
      {result && (
        <Card>
            <CardHeader>
              <div className='flex items-center gap-4'>
                <Target className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Ideal Body Weight (Hamwi Formula)</CardTitle>
                  <CardDescription>Optimal weight range for your height</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.ibw.toFixed(1)} kg</p>
                    <p className="text-muted-foreground">({(result.ibw * 2.20462).toFixed(1)} lbs)</p>
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">A healthy range is typically considered to be between <span className="font-semibold text-foreground">{result.range.min.toFixed(1)} kg</span> and <span className="font-semibold text-foreground">{result.range.max.toFixed(1)} kg</span>.</p>
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
              <h4 className="font-semibold text-foreground mb-2">Sex</h4>
              <p className="text-muted-foreground">
                The formula uses different calculations for men and women because biological sex affects body composition, bone structure, and typical weight distribution. Men typically have more muscle mass and larger frames, while women naturally carry more body fat for reproductive health. The Hamwi formula accounts for these differences.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Height</h4>
              <p className="text-muted-foreground">
                Height is the primary determinant in IBW calculations because it reflects your frame size and overall body structure. The formula assumes that taller individuals should weigh more to maintain healthy body proportions. You can enter height in either feet and inches (imperial) or centimeters (metric)—the calculator will convert as needed.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">The Hamwi Formula</h4>
              <p className="text-muted-foreground">
                This calculator uses the Hamwi formula: For men: IBW = 48 kg + 2.7 kg per inch over 5 feet. For women: IBW = 45.5 kg + 2.2 kg per inch over 5 feet. The formula provides a baseline estimate that can be adjusted ±10% to account for frame size variations. Note that the formula requires height to be over 5 feet (60 inches).
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
              Explore other body composition and weight management calculators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/bmi-calculator" className="text-primary hover:underline">
                    BMI Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate your Body Mass Index to compare with your ideal body weight.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/lean-body-mass-calculator" className="text-primary hover:underline">
                    Lean Body Mass Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Understand your muscle and lean tissue weight relative to your ideal weight.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/body-fat-percentage-calculator" className="text-primary hover:underline">
                    Body Fat Percentage Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate your body fat percentage to assess body composition at your ideal weight.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary hover:underline">
                    Daily Calorie Needs Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Determine the calories needed to reach or maintain your ideal body weight.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/calorie-deficit-calculator" className="text-primary hover:underline">
                    Calorie Deficit Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate the calorie deficit needed to reach your ideal body weight.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/calorie-surplus-calculator" className="text-primary hover:underline">
                    Calorie Surplus Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Determine calories needed if you're underweight and want to reach your ideal weight.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Complete Guide to Ideal Body Weight
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h2 className="text-xl font-bold text-foreground">Ideal Body Weight (IBW) Calculator: Discover Your Optimal Weight for Health and Longevity</h2>
            <p>Your Ideal Body Weight (IBW) represents the weight at which your body functions optimally — balancing lean mass, fat
              percentage, and overall well-being. It's not about being "perfect" or reaching a specific number, but finding the
    healthiest weight range for your height, age, sex, and body frame. This guide explains the science behind IBW,
              different formulas, and how to use it as part of a sustainable fitness plan.</p>

  <h3 className="font-semibold text-foreground mt-6">⚖️ What Is Ideal Body Weight (IBW)?</h3>
            <p>The concept of Ideal Body Weight dates back to the early 20th century, when doctors sought to identify weight ranges
    linked with the lowest risk of disease and mortality. Today, IBW is used in medicine, nutrition, and fitness to guide
              dosing, calorie needs, and health assessments. It provides a reference point — not a rigid goal.</p>
            <p>IBW considers factors like <strong>height, sex, and body frame size</strong>. It doesn't measure fat distribution or
    muscle mass directly, but it helps estimate a balanced weight zone that supports cardiovascular, hormonal, and
              metabolic health.</p>

  <h3 className="font-semibold text-foreground mt-6">📏 Common IBW Formulas</h3>
            <p>Different researchers have proposed equations to estimate IBW. All are based on the assumption that height is the
              strongest determinant of ideal weight.</p>
  <ul className="list-disc ml-6 space-y-1">
              <li><strong>Devine Formula (1974):</strong> Men: 50 kg + 2.3 kg for each inch over 5 ft; Women: 45.5 kg + 2.3 kg for each inch over 5 ft. <em>Widely used in medicine, especially for drug dosing.</em></li>
              <li><strong>Robinson Formula (1983):</strong> Men: 52 kg + 1.9 kg for each inch over 5 ft; Women: 49 kg + 1.7 kg for each inch over 5 ft</li>
              <li><strong>Hamwi Formula (1964):</strong> Men: 48.0 kg + 2.7 kg per inch over 5 ft; Women: 45.5 kg + 2.2 kg per inch over 5 ft</li>
              <li><strong>Miller Formula (1983):</strong> Men: 56.2 kg + 1.41 kg per inch over 5 ft; Women: 53.1 kg + 1.36 kg per inch over 5 ft</li>
  </ul>
            <p>These formulas typically provide slightly different results, offering a reasonable range rather than a single
              "correct" number. The calculator averages them for a balanced estimate.</p>

  <h3 className="font-semibold text-foreground mt-6">🧬 Frame Size Adjustment</h3>
            <p>Two people of the same height can have different ideal weights depending on their body frame (bone structure and
              limb proportions). You can estimate your frame size using the <strong>wrist circumference-to-height ratio</strong>:</p>
  <ul className="list-disc ml-6 space-y-1">
  <li>Small frame: wrist &lt; 6.0 inches (for average adult height)</li>
  <li>Medium frame: 6.0–6.75 inches</li>
  <li>Large frame: &gt; 6.75 inches</li>
</ul>
            <p>Typically, small-framed individuals fall toward the lower end of the IBW range, while large-framed individuals may be
              healthy at slightly higher weights.</p>

            <h3 className="font-semibold text-foreground mt-6">📊 Example: Calculating IBW for a 5'8" Male</h3>
  <ul className="list-disc ml-6 space-y-1">
    <li>Devine: 50 + (2.3 × 8) = 68.4 kg</li>
    <li>Robinson: 52 + (1.9 × 8) = 67.2 kg</li>
    <li>Hamwi: 48 + (2.7 × 8) = 69.6 kg</li>
    <li>Miller: 56.2 + (1.41 × 8) = 67.5 kg</li>
  </ul>
  <p>Average IBW = 68.2 kg (≈150 lb)</p>

  <h3 className="font-semibold text-foreground mt-6">💪 IBW vs. BMI vs. Body Fat</h3>
            <p>Many people confuse IBW with BMI (Body Mass Index), but they measure different things. BMI is a population-based
              indicator, while IBW is more individualized.</p>
  <ul className="list-disc ml-6 space-y-1">
              <li><strong>IBW:</strong> Based on height, provides a healthy weight range for medical and nutritional use.</li>
              <li><strong>BMI:</strong> A ratio of weight to height (kg/m²), often used in public health but doesn't distinguish fat vs. muscle.</li>
              <li><strong>Body Fat %:</strong> Measures fat composition directly — most accurate for tracking aesthetic or metabolic goals.</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">🔥 Why Knowing Your IBW Matters</h3>
  <ul className="list-disc ml-6 space-y-1">
    <li>Helps identify healthy weight goals for dieting or bulking.</li>
    <li>Improves dosing accuracy for medications and IV fluids in clinical settings.</li>
    <li>Assists athletes in maintaining optimal power-to-weight ratios.</li>
    <li>Provides a starting point for calculating caloric and macronutrient needs.</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">🥗 Nutrition and IBW</h3>
            <p>Once you know your IBW, you can tailor your nutrition to reach or maintain it. The goal is not crash dieting but
              building a long-term balance between calories, macronutrients, and activity.</p>
  <ul className="list-disc ml-6 space-y-1">
    <li>Eat a balanced diet with 45–65% carbs, 20–35% fat, and 15–25% protein.</li>
    <li>Include plenty of fruits, vegetables, and whole grains for micronutrients.</li>
    <li>Stay hydrated — water supports metabolism and digestion.</li>
    <li>Avoid extreme calorie restriction — it reduces lean mass and metabolism.</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">🏋️ Training and IBW</h3>
            <p>Exercise plays a critical role in maintaining ideal weight — especially by preserving lean mass. Resistance training
              boosts metabolism, while cardio supports heart and lung health.</p>
  <ul className="list-disc ml-6 space-y-1">
    <li>Strength training: 3–4 sessions per week to maintain muscle.</li>
    <li>Cardio: 150 minutes of moderate or 75 minutes of intense activity per week.</li>
    <li>Flexibility and balance work: 2–3 sessions weekly (e.g., yoga, mobility drills).</li>
  </ul>

            <h3 className="font-semibold text-foreground mt-6">📉 When You're Below or Above IBW</h3>
            <p>Being significantly below or above your IBW can have health implications — though context matters (e.g., athletes may
              exceed IBW due to higher muscle mass).</p>
  <ul className="list-disc ml-6 space-y-1">
              <li><strong>Below IBW:</strong> May cause fatigue, nutrient deficiencies, hormonal imbalance, and weakened immunity.</li>
              <li><strong>Above IBW:</strong> May increase risk for hypertension, diabetes, and cardiovascular strain.</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">🧠 How to Use IBW in Real Life</h3>
  <ul className="list-disc ml-6 space-y-1">
    <li>Set realistic weight goals aligned with fitness or aesthetic preferences.</li>
    <li>Estimate caloric maintenance or deficit levels more accurately.</li>
    <li>Track progress alongside body fat % for a complete picture.</li>
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
              Common questions about ideal body weight and healthy weight ranges
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Is IBW the same as a healthy weight?</h4>
              <p className="text-muted-foreground">
                Not exactly — IBW is a guideline, while "healthy weight" can vary based on muscle mass, age, and fitness level. IBW provides a reference point based on height and sex, but factors like body composition, activity level, and individual health markers also determine what's truly healthy for you. A muscular athlete may be perfectly healthy above their IBW, while someone with low muscle mass might be unhealthy even at their IBW.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's more accurate: IBW or BMI?</h4>
              <p className="text-muted-foreground">
                IBW is more personalized, but both should be considered alongside body composition. IBW accounts for height and sex differences more directly, while BMI is a simple ratio that works well for population screening but can misclassify individuals. Neither is perfect—combine IBW, BMI, body fat percentage, waist circumference, and other health markers for the most complete picture.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can you be healthy outside your IBW range?</h4>
              <p className="text-muted-foreground">
                Absolutely. Many athletes and muscular individuals weigh more than their IBW but are extremely healthy. Conversely, some people may be healthy slightly below their IBW if they have a small frame. The IBW range (typically ±10% of the calculated value) accounts for these variations. Health depends on body composition, fitness level, blood markers, and lifestyle factors, not just hitting an exact weight number.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How can I lower weight safely to reach IBW?</h4>
              <p className="text-muted-foreground">
                Aim for 0.5–1 kg loss per week via moderate calorie deficit, resistance training, and high-protein meals. Focus on a small calorie deficit (300-500 calories below maintenance), prioritize protein intake (1.6-2.2 g/kg body weight) to preserve muscle, engage in strength training 2-3 times per week, and be patient—safe, sustainable weight loss takes time.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can IBW change with age?</h4>
              <p className="text-muted-foreground">
                Slightly — lean mass tends to decrease with age, so ideal ranges may adjust downward unless countered with strength training. However, the IBW formula itself doesn't account for age. What changes is that maintaining the same weight may require more effort (or result in different body composition) as you age due to natural muscle loss (sarcopenia). Regular strength training helps maintain lean mass and metabolic health at any age.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I use IBW if I'm an athlete?</h4>
              <p className="text-muted-foreground">
                IBW can still be useful as a reference, but athletes often exceed it due to higher muscle mass. For athletes, body fat percentage and performance metrics are more relevant than IBW. Power athletes (weightlifters, bodybuilders) may be perfectly healthy at 110-120% of IBW, while endurance athletes might be healthy at 90-95% of IBW. Use IBW as one of many tools, not the sole determinant of health.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I account for frame size in IBW?</h4>
              <p className="text-muted-foreground">
                Frame size affects your healthy weight range—small frames tend toward the lower end (90% of IBW), large frames toward the upper end (110% of IBW). You can estimate frame size by measuring your wrist circumference relative to your height. The IBW calculator provides a ±10% range to account for frame variations. If you know you have a particularly large or small frame, adjust accordingly within that range.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Is IBW useful for weight loss goals?</h4>
              <p className="text-muted-foreground">
                Yes, IBW can provide a realistic target for weight loss, especially if you're significantly above it. However, focus on sustainable methods rather than rushing to hit the exact number. Use IBW as a long-term goal, combine it with body fat percentage tracking to ensure you're losing fat (not just weight), and remember that health includes many factors beyond a specific weight number.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What if I'm very tall or very short?</h4>
              <p className="text-muted-foreground">
                IBW formulas work best for heights between 5 feet and 6 feet 3 inches. For extremely tall or short individuals, the formulas may be less accurate. If you're outside this range, consider using body fat percentage and other health markers as primary guides. The Hamwi formula (used by this calculator) requires height over 5 feet, so very short individuals may need alternative assessments.
    </p>
  </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How often should I recalculate my IBW?</h4>
              <p className="text-muted-foreground">
                IBW is based on height, which doesn't change significantly for adults (unless you're still growing or experience height loss with age). Recalculate only if your height measurement changes. However, your target weight within the IBW range may shift based on your goals, body composition changes, or fitness level improvements. Use IBW as a stable reference point, not something that needs frequent recalculation.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
