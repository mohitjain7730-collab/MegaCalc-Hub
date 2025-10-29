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
import { TrendingDown, Info, Target, BarChart3, HelpCircle } from 'lucide-react';
import Link from 'next/link';

const activityLevels = {
    sedentary: 1.2,
    lightly: 1.375,
    moderately: 1.55,
    very: 1.725,
    extra: 1.9,
};

const formSchema = z.object({
  age: z.number().int().positive(),
  sex: z.enum(['male', 'female']),
  weight: z.number().positive(),
  height: z.number().positive(),
  activityLevel: z.string(),
  weeklyLossGoal: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CalorieDeficitCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      activityLevel: 'lightly',
    },
  });

  const onSubmit = (values: FormValues) => {
    let bmr;
    if (values.sex === 'male') {
      bmr = (10 * values.weight) + (6.25 * values.height) - (5 * values.age) + 5;
    } else {
      bmr = (10 * values.weight) + (6.25 * values.height) - (5 * values.age) - 161;
    }
    
    const tdee = bmr * activityLevels[values.activityLevel as keyof typeof activityLevels];
    const dailyDeficit = (values.weeklyLossGoal * 7700) / 7;
    const targetCalories = tdee - dailyDeficit;
    
    setResult(targetCalories);
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Calculate Your Calorie Deficit
          </CardTitle>
          <CardDescription>
            Determine your daily calorie intake target for safe and sustainable weight loss
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="age" render={({ field }) => (<FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="sex" render={({ field }) => (<FormItem><FormLabel>Sex</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent></Select></FormItem>)} />
                <FormField control={form.control} name="weight" render={({ field }) => (<FormItem><FormLabel>Weight (kg)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="height" render={({ field }) => (<FormItem><FormLabel>Height (cm)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="activityLevel" render={({ field }) => (<FormItem><FormLabel>Activity Level</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{Object.keys(activityLevels).map(level => <SelectItem key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                <FormField control={form.control} name="weeklyLossGoal" render={({ field }) => (<FormItem><FormLabel>Weekly Weight Loss Goal (kg)</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
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
                <TrendingDown className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Target Daily Calories</CardTitle>
                  <CardDescription>Recommended daily intake for weight loss</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.toFixed(0)}</p>
                    <CardDescription>This is your estimated daily calorie intake for your weight loss goal.</CardDescription>
                    {result < 1200 && (
                      <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-red-600 dark:text-red-400 text-sm font-semibold">Warning: Intake below 1,200 calories may be unsafe without medical supervision.</p>
                      </div>
                    )}
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
              <h4 className="font-semibold text-foreground mb-2">Age, Sex, Weight, Height</h4>
              <p className="text-muted-foreground">
                These inputs are used to calculate your Basal Metabolic Rate (BMR) using the Mifflin-St Jeor equation. BMR is the calories your body burns at rest for basic functions. Age and sex affect metabolic rate—metabolism naturally slows with age, and men typically have higher BMRs than women due to greater muscle mass.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Activity Level</h4>
              <p className="text-muted-foreground">
                This multiplier accounts for your daily physical activity beyond resting metabolism. Choose the level that best matches your lifestyle: Sedentary (1.2x) for desk jobs with minimal exercise, Lightly Active (1.375x) for light exercise 1-3 days/week, Moderately Active (1.55x) for moderate exercise 3-5 days/week, Very Active (1.725x) for hard exercise 6-7 days/week. This converts BMR to Total Daily Energy Expenditure (TDEE).
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Weekly Weight Loss Goal</h4>
              <p className="text-muted-foreground">
                Enter how much weight you want to lose per week (in kg). Safe goals are typically 0.5-1 kg (1-2 lbs) per week. The calculator converts this to a daily calorie deficit: 1 kg of fat ≈ 7,700 calories, so losing 0.5 kg/week requires a ~550 calorie/day deficit. Be realistic—aggressive goals (over 1 kg/week) may not be sustainable and can lead to muscle loss.
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
              Explore other nutrition and weight management calculators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary hover:underline">
                    Daily Calorie Needs Calculator (TDEE)
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate your maintenance calories (TDEE) to understand your baseline before creating a deficit.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/bmr-calculator" className="text-primary hover:underline">
                    BMR Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Understand your Basal Metabolic Rate, the foundation of all calorie calculations.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/protein-intake-calculator" className="text-primary hover:underline">
                    Protein Intake Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate optimal protein intake to preserve muscle mass during your calorie deficit.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/macro-ratio-calculator" className="text-primary hover:underline">
                    Macro Ratio Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Optimize your macronutrient distribution within your calorie deficit target.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section - All original content preserved */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Complete Guide to Calorie Deficit
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h2 className="text-xl font-bold text-foreground">The Ultimate Calorie Deficit Calculator Guide: Fueling Safe, Sustainable Weight Loss</h2>
            
            <p><em><strong>Disclaimer:</strong> This guide provides educational content based on scientific and nutritional guidelines. Consult a physician or registered dietitian before starting any restrictive diet or exercise program, especially if you have pre-existing health conditions or are taking medication.</em></p>

            <h3 className="font-semibold text-foreground mt-6">The Law of Energy Balance: What is a Calorie Deficit?</h3>
            <p>Weight management ultimately adheres to the law of thermodynamics: **energy balance**. A **calorie deficit** occurs when you consistently consume fewer calories (energy in) than your body expends (energy out). When this deficit is created, your body is forced to use stored energy—primarily body fat—to meet its energy needs, resulting in weight loss.</p>
            
            <p>The Calorie Deficit Calculator is the tool that quantifies this crucial balance. It takes your unique physiological data (age, sex, height, weight) and activity level to estimate your daily energy needs, giving you a precise number to target for safe and effective weight loss.</p>
            
            <h4 className="font-semibold text-foreground mt-4">The Fat Loss Equation</h4>
            <p>The generally accepted rule of thumb is that **1 pound (0.45 kg) of body fat contains roughly 3,500 calories**. Therefore, to lose 1 pound per week, you need to establish a cumulative weekly deficit of 3,500 calories, or a consistent daily deficit of 500 calories.</p>
            <p className="font-mono bg-muted p-2 rounded">Daily Calorie Deficit = Total Daily Energy Expenditure (TDEE) − Target Calorie Intake</p>

            <h3 className="font-semibold text-foreground mt-6">The Calculation Core: BMR and TDEE Explained</h3>
            <p>The calculator works in two distinct stages to determine your energy expenditure:</p>

            <h4 className="font-semibold text-foreground mt-4">Stage 1: Basal Metabolic Rate (BMR)</h4>
            <p>BMR is the minimum number of calories your body needs to maintain basic, life-sustaining functions (like breathing, circulation, and temperature regulation) while at complete rest. It accounts for **60% to 75%** of the total calories you burn daily.</p>
            <p>The calculator typically uses the highly accurate **Mifflin-St Jeor Equation** to estimate BMR:</p>
            <ul className="list-disc ml-6 space-y-1">
                <li>**Men:** (10 × weight in kg) + (6.25 × height in cm) − (5 × age in years) + 5</li>
                <li>**Women:** (10 × weight in kg) + (6.25 × height in cm) − (5 × age in years) − 161</li>
            </ul>
            
            <h4 className="font-semibold text-foreground mt-4">Stage 2: Total Daily Energy Expenditure (TDEE)</h4>
            <p>TDEE is the total number of calories you burn over a 24-hour period, representing your **maintenance calories** (the calories needed to stay at your current weight). TDEE includes:</p>
            <ul className="list-disc ml-6 space-y-1">
                <li>**BMR** (Basal Metabolic Rate)</li>
                <li>**NEAT** (Non-Exercise Activity Thermogenesis: fidgeting, standing, walking)</li>
                <li>**TEA** (Thermic Effect of Activity: planned exercise)</li>
                <li>**TEF** (Thermic Effect of Food: energy used for digestion, roughly 10% of total calories)</li>
            </ul>
            
            <p>The calculator determines TDEE by multiplying BMR by an **Activity Factor** based on your lifestyle:</p>
            <div className="overflow-x-auto my-4">
                <table className="min-w-full border-collapse border border-gray-200 dark:border-gray-700 text-sm">
                    <thead>
                        <tr className="bg-muted text-left">
                            <th className="border p-2">Activity Level</th>
                            <th className="border p-2">Multiplier</th>
                            <th className="border p-2">Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border p-2">Sedentary</td>
                            <td className="border p-2">1.2</td>
                            <td className="border p-2">Little to no exercise, desk job.</td>
                        </tr>
                        <tr>
                            <td className="border p-2">Lightly Active</td>
                            <td className="border p-2">1.375</td>
                            <td className="border p-2">Light exercise 1-3 days per week.</td>
                        </tr>
                        <tr>
                            <td className="border p-2">Moderately Active</td>
                            <td className="border p-2">1.55</td>
                            <td className="border p-2">Moderate exercise 3-5 days per week.</td>
                        </tr>
                        <tr>
                            <td className="border p-2">Very Active</td>
                            <td className="border p-2">1.725</td>
                            <td className="border p-2">Hard exercise 6-7 days per week.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h3 className="font-semibold text-foreground mt-6">The Gold Standard: Calculating Your Safe Calorie Deficit</h3>
            <p>The goal is to find the **sweet spot**—a deficit large enough to promote fat loss, but small enough to be sustainable without causing muscle loss or extreme fatigue.</p>

            <h4 className="font-semibold text-foreground mt-4">The Recommended Daily Deficit</h4>
            <ul className="list-disc ml-6 space-y-1">
                <li>**Target Weight Loss:** 1 to 2 pounds (0.45 to 0.9 kg) per week.</li>
                <li>**Target Deficit:** **500 to 1,000 calories per day** subtracted from your TDEE.</li>
            </ul>
            
            <p>A **500-calorie deficit** is often recommended as the starting point for most people, as it results in the safe loss of about 1 pound per week. A 1,000-calorie deficit should generally only be used by individuals with a high TDEE (high body weight or high activity level) to ensure total intake does not drop below critical minimums.</p>

            <h4 className="font-semibold text-foreground mt-4">Minimum Calorie Intake Thresholds</h4>
            <p>Consuming too few calories can lead to nutrient deficiencies, loss of muscle mass, and metabolic slowdown. The calculator should flag if your resulting goal falls below these minimums:</p>
            <ul className="list-disc ml-6 space-y-1">
                <li>**Absolute Minimum for Women:** 1,200 calories per day</li>
                <li>**Absolute Minimum for Men:** 1,500 calories per day</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">Macronutrients: Optimizing Your Deficit for Fat Loss and Muscle Preservation</h3>
            <p>A successful calorie deficit is not just about the total number; it's about the **quality and composition** of those calories. Strategic macronutrient planning ensures your body burns fat while protecting muscle mass.</p>

            <h4 className="font-semibold text-foreground mt-4">Protein: The Muscle Preserver</h4>
            <p>Protein is the most important macronutrient during a calorie deficit because it has the highest **Thermic Effect of Food (TEF)** (burning more calories during digestion) and is essential for muscle repair.</p>
            <ul className="list-disc ml-6 space-y-1">
                <li>**Goal:** Aim for a high-protein intake, typically **1.4 to 2.2 grams per kilogram (kg)** of body weight, especially if you are strength training.</li>
                <li>**Benefit:** High protein maximizes satiety (feeling full) and minimizes muscle loss.</li>
            </ul>

            <h4 className="font-semibold text-foreground mt-4">Carbohydrates and Fats</h4>
            <ul className="list-disc ml-6 space-y-1">
                <li>**Carbohydrates:** Focus on complex carbohydrates (whole grains, fruits, vegetables) and fiber. Carbs should typically account for **45%–65%** of total calories, adjusted based on activity level.</li>
                <li>**Fats:** Healthy fats (avocados, nuts, olive oil) are vital for hormone production and nutrient absorption. Aim for **20%–35%** of total calories, ensuring at least **0.5 grams per kg of body weight** to avoid deficiency.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">Actionable Strategies for Creating a Deficit (Diet vs. Exercise)</h3>
            <p>The most sustainable weight loss programs combine dietary reduction with increased physical activity.</p>

            <h4 className="font-semibold text-foreground mt-4">Dietary Reduction (The Primary Lever)</h4>
            <ul className="list-disc ml-6 space-y-1">
                <li>**Cut Liquid Calories:** Eliminate high-calorie beverages like sodas, sugary juices, and cream-heavy coffee drinks. Swapping a 250-calorie soda for water immediately creates a significant deficit.</li>
                <li>**Increase Volume, Reduce Density:** Prioritize whole foods rich in fiber and water (vegetables, fruits, lean protein) over calorie-dense, processed foods. This helps maximize fullness on fewer calories.</li>
                <li>**Practice Portion Control:** Use a food scale or measuring cups, especially in the initial tracking phase, to ensure accurate counting. **Underestimating food intake is the #1 reason diets fail.**</li>
            </ul>

            <h4 className="font-semibold text-foreground mt-4">Activity Increase (The Secondary Lever)</h4>
            <ul className="list-disc ml-6 space-y-1">
                <li>**Targeted Exercise:** Engage in **150 minutes of moderate-intensity aerobic activity** per week. This directly increases your TDEE.</li>
                <li>**Build Muscle:** Incorporate **strength training** (2-3 days per week). Muscle tissue is metabolically active, boosting your BMR and helping you burn more calories even at rest.</li>
                <li>**Increase NEAT:** Actively increase Non-Exercise Activity Thermogenesis (NEAT) by taking the stairs, walking during calls, or fidgeting more. This small, consistent energy expenditure can add hundreds of calories to your deficit over the course of a week.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">Weight Loss Pitfalls: Avoiding Metabolic Slowdown and Withdrawal</h3>
            <p>Long-term success requires adapting to the body's natural response to a sustained calorie deficit.</p>

            <h4 className="font-semibold text-foreground mt-4">Managing Metabolic Adaptation</h4>
            <p>If you stay in a calorie deficit for too long, your body may initiate **metabolic adaptation** (often inaccurately called "starvation mode"). This is a protective mechanism where the body lowers the TDEE (making it harder to lose weight) to conserve energy.</p>
            <ul className="list-disc ml-6 space-y-1">
                <li>**Re-evaluation:** Your maintenance calories (TDEE) decrease as you lose weight. Recalculate your TDEE every **4-6 weeks** and adjust your target intake accordingly.</li>
                <li>**Diet Breaks:** Consider occasional, controlled "diet breaks" where you temporarily eat at maintenance calories for 1–2 weeks to mitigate the metabolic slowdown effect.</li>
            </ul>

            <h4 className="font-semibold text-foreground mt-4">Symptoms of an Unhealthy Deficit</h4>
            <p>If you experience any of the following, your calorie deficit is too aggressive and should be increased immediately:</p>
            <ul className="list-disc ml-6 space-y-1">
                <li>Extreme, persistent fatigue and lethargy.</li>
                <li>Hair loss or brittle nails.</li>
                <li>Loss of menstrual period (in women).</li>
                <li>Chronic irritability, mood swings, or "hangriness."</li>
                <li>Rapid weight loss exceeding 2 pounds per week (after the initial water weight loss phase).</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">Keys to Long-Term, Sustainable Success</h3>
            <p>The Calorie Deficit Calculator provides a number, but a successful weight loss journey requires a commitment to new habits and a holistic view of health. Focus on nutrient-rich whole foods, consistent physical activity, adequate sleep, and stress management to ensure your deficit is healthy, sustainable, and leads to permanent results.</p>
            
            <div className="text-sm italic text-center mt-8 pt-4 border-t">
                <p>This guide is based on established nutritional and metabolic science, referencing guidelines from the National Academy of Sports Medicine (NASM), the CDC, and the Mifflin-St Jeor equation for BMR calculation.</p>
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
            <CardDescription>
              Common questions about calorie deficits and weight loss
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is a safe calorie deficit?</h4>
              <p className="text-muted-foreground">
                A safe calorie deficit is typically 500-1,000 calories per day, resulting in 0.5-1 kg (1-2 lbs) of weight loss per week. A 500-calorie deficit is ideal for most people as it's sustainable and minimizes muscle loss. Deficit above 1,000 calories/day should only be used by those with very high TDEEs (to avoid dropping below minimum calorie thresholds of 1,200 for women, 1,500 for men) and may require medical supervision. More aggressive deficits lead to muscle loss, metabolic slowdown, and nutrient deficiencies.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I know if my calorie deficit is too aggressive?</h4>
              <p className="text-muted-foreground">
                Warning signs include: extreme fatigue that doesn't improve with rest, hair loss or brittle nails, loss of menstrual period (women), chronic irritability or mood swings, sleeping problems, constant hunger, losing more than 1 kg per week (after initial water weight), and feeling cold all the time. If you experience these, increase your calorie intake immediately. Sustainable weight loss should feel manageable, not punishing.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Why isn't my weight loss matching my calorie deficit?</h4>
              <p className="text-muted-foreground">
                Several factors can cause this: water weight fluctuations can mask fat loss (especially early on or around menstrual cycles), inaccurate food tracking (underestimating portions is common), metabolic adaptation (your TDEE decreases as you lose weight and adapt to the deficit), changes in activity level, and muscle gain (which increases weight). Focus on trends over weeks, not daily fluctuations. If weight loss stalls for 2+ weeks despite adherence, recalculate your TDEE—it may have changed.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I create a deficit through diet or exercise?</h4>
              <p className="text-muted-foreground">
                Both are valuable, but diet is typically more effective for creating the deficit (you can't out-exercise a poor diet). However, exercise helps preserve muscle mass and can increase your deficit. The best approach: create 70-80% of the deficit through diet (easier to control) and 20-30% through exercise (cardio burns calories, strength training preserves muscle). Combining both makes the deficit more sustainable and preserves metabolic health better than dieting alone.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How often should I recalculate my calorie deficit?</h4>
              <p className="text-muted-foreground">
                Recalculate your TDEE and adjust your deficit every 4-6 weeks or after losing 5-10% of your body weight. As you lose weight, your BMR decreases (smaller body needs fewer calories), so your maintenance calories drop. If you don't adjust, your deficit becomes smaller over time, slowing progress. Also recalculate if you significantly change your activity level—more exercise means higher TDEE and possibly a larger allowable deficit.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I still build muscle in a calorie deficit?</h4>
              <p className="text-muted-foreground">
                It's challenging but possible, especially for beginners, people returning to training after a break, or those using a small deficit (200-500 calories). Success requires high protein intake (1.6-2.2 g/kg body weight), consistent strength training, adequate sleep, and a modest deficit. Advanced lifters typically can't build significant muscle in a deficit. For most people, the goal during a deficit should be to preserve muscle (not lose it), which requires protein and resistance training.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What should I eat on a calorie deficit?</h4>
              <p className="text-muted-foreground">
                Prioritize nutrient-dense foods: lean proteins (chicken, fish, tofu, legumes) for muscle preservation and satiety, vegetables and fruits for volume and micronutrients, whole grains for sustained energy, and healthy fats for hormone production. Focus on high-volume, low-calorie foods (soups, salads, vegetables) to maximize fullness. Limit processed foods, sugary drinks, and calorie-dense snacks. Use tools like food scales and tracking apps to ensure accuracy—most people underestimate portions.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Do I need to be perfect with my calorie deficit every day?</h4>
              <p className="text-muted-foreground">
                No—consistency over perfection is key. Being within 100-200 calories of your target most days is fine. Occasional days slightly over or under won't derail progress. What matters is the weekly average deficit. Some people use "calorie banking" (eating slightly less some days to have more flexibility other days) or structured refeed days (eating at maintenance 1-2 days/week). However, don't use this as an excuse for constant overeating—sustained adherence is what drives results.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What happens after I reach my goal weight?</h4>
              <p className="text-muted-foreground">
                Transition to maintenance calories gradually. Increase intake by 100-200 calories per day each week until you reach your new TDEE (which will be lower than when you started due to weight loss). Monitor your weight for 2-3 weeks—if stable, you've found maintenance. If still losing, add another 100-200 calories. Sudden increases can cause rapid weight regain. This "reverse dieting" approach helps your metabolism adjust and prevents the common post-diet weight regain.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I use a calorie deficit if I have a medical condition?</h4>
              <p className="text-muted-foreground">
                Consult with your healthcare provider and/or a registered dietitian before starting a calorie deficit if you have: diabetes, heart disease, kidney disease, eating disorders, are pregnant/breastfeeding, or take medications that affect metabolism. Some conditions require specialized nutrition plans, while others may need calorie deficits to be implemented gradually or with medical supervision. Never go below minimum calorie thresholds without professional guidance.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
