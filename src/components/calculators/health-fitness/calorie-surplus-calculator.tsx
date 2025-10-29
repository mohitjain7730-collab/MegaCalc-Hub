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
import { TrendingUp, Info, Target, BarChart3, HelpCircle } from 'lucide-react';
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
  weeklyGainGoal: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CalorieSurplusCalculator() {
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
    const dailySurplus = (values.weeklyGainGoal * 7700) / 7;
    const targetCalories = tdee + dailySurplus;
    
    setResult(targetCalories);
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Calculate Your Calorie Surplus
          </CardTitle>
          <CardDescription>
            Determine your daily calorie intake target for lean muscle gain (bulking)
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
            <FormField control={form.control} name="weeklyGainGoal" render={({ field }) => (<FormItem><FormLabel>Weekly Weight Gain Goal (kg)</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
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
                <TrendingUp className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Target Daily Calories</CardTitle>
                  <CardDescription>Recommended daily intake for muscle gain</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.toFixed(0)}</p>
                    <CardDescription>Combine with resistance training to promote muscle gain.</CardDescription>
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
                These inputs calculate your Basal Metabolic Rate (BMR) using the Mifflin-St Jeor equation. Your BMR is the calories needed for basic body functions at rest. Age, sex, weight, and height all influence metabolic rate—metabolism decreases with age, and men typically have higher BMRs due to greater muscle mass.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Activity Level</h4>
              <p className="text-muted-foreground">
                This multiplier accounts for your daily physical activity beyond resting. Choose your level: Sedentary (1.2x) for desk jobs, Lightly Active (1.375x) for light exercise 1-3 days/week, Moderately Active (1.55x) for moderate exercise 3-5 days/week, Very Active (1.725x) for hard exercise 6-7 days/week. This converts BMR to Total Daily Energy Expenditure (TDEE)—your maintenance calories.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Weekly Weight Gain Goal</h4>
              <p className="text-muted-foreground">
                Enter how much weight you want to gain per week (in kg). For lean bulking, aim for 0.25-0.5 kg (0.5-1 lb) per week to maximize muscle gain while minimizing fat gain. The calculator converts this to a daily surplus: gaining 0.5 kg/week requires a ~550 calorie/day surplus. Beginners can handle larger surpluses (400-500 cal), while advanced lifters should use smaller surpluses (250-300 cal) to avoid excess fat gain.
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
              Explore other nutrition and muscle gain calculators
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
                  Calculate your maintenance calories to understand your baseline before adding a surplus.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/protein-intake-calculator" className="text-primary hover:underline">
                    Protein Intake Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate optimal protein intake to maximize muscle protein synthesis during your surplus.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/macro-ratio-calculator" className="text-primary hover:underline">
                    Macro Ratio Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Optimize your macronutrient distribution for muscle gain within your calorie target.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/calorie-deficit-calculator" className="text-primary hover:underline">
                    Calorie Deficit Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Plan your cutting phase after bulking to reduce fat gained during the surplus period.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/bmr-calculator" className="text-primary hover:underline">
                    BMR Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate your basal metabolic rate to understand your body's baseline energy needs.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/carbohydrate-intake-calculator" className="text-primary hover:underline">
                    Carbohydrate Intake Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Determine optimal carbohydrate intake to fuel your workouts and support muscle gain.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/fat-intake-calculator" className="text-primary hover:underline">
                    Fat Intake Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate healthy fat intake to support hormone production and overall health during bulking.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/body-fat-percentage-calculator" className="text-primary hover:underline">
                    Body Fat Percentage Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Monitor body composition changes to ensure your surplus is building muscle, not just fat.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/lean-body-mass-calculator" className="text-primary hover:underline">
                    Lean Body Mass Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Track lean muscle mass growth during your bulking phase to measure true progress.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section - All original content preserved */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Complete Guide to Calorie Surplus
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h2 className="text-xl font-bold text-foreground">The Ultimate Calorie Surplus Calculator Guide: Fueling Muscle Gain (Lean Bulking)</h2>
    
    <p><em><strong>Disclaimer:</strong> This guide provides educational information based on sports nutrition and physiological science. It is not a substitute for medical advice. Consult a healthcare provider or registered dietitian before beginning a hypercaloric diet, especially if you have pre-existing health conditions.</em></p>

            <h3 className="font-semibold text-foreground mt-6">What is a Calorie Surplus? The Anabolic Requirement</h3>
            <p>A **Calorie Surplus** is the opposite of a calorie deficit: it occurs when you consistently consume more calories (energy in) than your body burns (energy out). For those aiming to increase body weight in the form of muscle mass—a process often called **bulking**—a surplus is non-negotiable. Without extra energy, the body cannot support the intense anabolic (building) processes required for **Muscle Protein Synthesis (MPS)** that occurs after resistance training.</p>
    
    <p>The **Calorie Surplus Calculator** is an essential tool that defines your energy baseline and recommends the precise number of extra calories needed to initiate muscle growth while simultaneously preventing excessive, unwanted fat accumulation (a common mistake known as a "dirty bulk").</p>

            <h3 className="font-semibold text-foreground mt-6">Calculating the Foundation: BMR and Total Daily Energy Expenditure (TDEE)</h3>
    <p>Before establishing a surplus, you must first accurately determine your **Maintenance Calories**, or the total energy you burn daily (TDEE).</p>

            <h4 className="font-semibold text-foreground mt-4">Stage 1: Basal Metabolic Rate (BMR)</h4>
    <p>BMR is the base amount of energy your body requires to function at rest. The calculator uses physiological data (age, height, weight) with the reliable **Mifflin-St Jeor Equation**:</p>
    <ul className="list-disc ml-6 space-y-1">
                <li>**Men:** (10 × weight in kg) + (6.25 × height in cm) − (5 × age in years) + 5</li>
                <li>**Women:** (10 × weight in kg) + (6.25 × height in cm) − (5 × age in years) − 161</li>
    </ul>
    
            <h4 className="font-semibold text-foreground mt-4">Stage 2: Total Daily Energy Expenditure (TDEE)</h4>
    <p>Your **TDEE** (Maintenance Calories) is calculated by multiplying your BMR by an activity factor (PAL), which accounts for your job, daily movements, and structured exercise:</p>
    <ul className="list-disc ml-6 space-y-1">
                <li>**Sedentary:** BMR × 1.2</li>
                <li>**Moderately Active:** BMR × 1.55 (Typically the correct factor for those lifting weights 3-5 times per week)</li>
                <li>**Very Active:** BMR × 1.725 (For individuals lifting 6-7 times per week or those with physically demanding jobs)</li>
    </ul>
    <p>***The TDEE is your starting line. Any calories consumed above this number create the surplus.***</p>

            <h3 className="font-semibold text-foreground mt-6">The Lean Bulk Zone: Determining Your Safe Calorie Surplus (250-500 kcal)</h3>
    <p>The goal of a **lean bulk** is to maximize muscle gain while minimizing fat gain. This requires a carefully controlled, modest surplus. Too large a surplus will simply be stored as body fat, as muscle growth is a slow physiological process that cannot be rushed.</p>

            <h4 className="font-semibold text-foreground mt-4">Optimal Surplus Recommendations</h4>
    <ul className="list-disc ml-6 space-y-1">
        <li>**General Starting Point:** Add **250 to 500 calories** per day to your TDEE. This typically supports a weight gain of **0.5 to 1.0 pound (0.25 to 0.5 kg) per week**.</li>
        <li>**Beginners (Untrained):** Because beginners experience rapid muscle growth ("newbie gains"), they can tolerate the higher end of the surplus (400-500 calories) with less risk of fat gain.</li>
        <li>**Advanced Lifters (Trained):** Experienced lifters should aim for a more conservative surplus (250-300 calories) to minimize fat gain, as muscle protein synthesis slows down once genetic potential is approached.</li>
    </ul>

            <h4 className="font-semibold text-foreground mt-4">Why A Controlled Surplus is Key</h4>
    <p>Studies have shown that exceeding a moderate calorie surplus (e.g., adding 1000+ calories daily) does not significantly increase the rate of muscle growth but drastically increases the rate of fat storage. The body has a finite speed at which it can build muscle; the excess energy beyond that capacity becomes fat.</p>

            <h3 className="font-semibold text-foreground mt-6">Macronutrient Strategy for Hypercaloric Diets</h3>
    <p>In a calorie surplus, the source of the calories matters more than ever. The macronutrient ratio must be optimized to prioritize **Muscle Protein Synthesis (MPS)** and fuel high-intensity training.</p>

            <h4 className="font-semibold text-foreground mt-4">Protein: The Primary Anabolic Driver</h4>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Goal:** **1.6 to 2.2 grams of protein per kilogram (kg) of body weight** per day. This is critical for repairing muscle tissue damaged during resistance training.</li>
        <li>**Application:** Ensure protein intake is consistent and spread evenly across 4-6 meals to optimize the "muscle building window" throughout the day.</li>
    </ul>

            <h4 className="font-semibold text-foreground mt-4">Carbohydrates: Fuel and Glycogen Replenishment</h4>
    <p>Carbohydrates are the body's preferred fuel source, particularly for the high-intensity nature of weightlifting. Adequate carbohydrate intake replenishes muscle **glycogen stores**, which are essential for maintaining strength and training volume.</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Goal:** Carbs should make up the majority of remaining calories, typically **45% to 65%** of TDEE plus surplus.</li>
        <li>**Quality:** Focus on complex, whole-food sources like whole grains, rice, potatoes, and fruits.</li>
    </ul>

            <h4 className="font-semibold text-foreground mt-4">Fats: Hormonal Health and Energy Density</h4>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Goal:** Fats should account for **20% to 30%** of total daily calories.</li>
        <li>**Role:** Fats are vital for the production of critical muscle-building hormones, including **testosterone**. Focus on unsaturated sources (nuts, avocados, olive oil) while limiting saturated fat.</li>
    </ul>

            <h3 className="font-semibold text-foreground mt-6">Monitoring Progress: The Optimal Rate of Weight Gain</h3>
    <p>Since the goal is to gain muscle, not just fat, continuous tracking and adjustment of the calorie surplus are essential. If you are gaining too quickly, you are likely accumulating excessive fat mass, and the surplus needs to be reduced.</p>

            <h4 className="font-semibold text-foreground mt-4">Tracking Metrics</h4>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Scale Weight:** Weigh yourself daily (in the morning, before eating) and track the weekly average. Aim for **0.5% of your body weight gain per week** (e.g., a 200 lb person should gain about 1 lb/week).</li>
        <li>**Visual Assessment:** Use progress photos (taken weekly) and circumference measurements (waist, arms, chest) to monitor where the weight is being gained. If your waist circumference increases too rapidly, reduce the surplus.</li>
        <li>**Strength Progression:** Consistent increases in strength and training volume in the gym are the best indicators that the surplus is being utilized for **muscle anabolism**.</li>
    </ul>

            <h4 className="font-semibold text-foreground mt-4">When to Adjust the Surplus</h4>
    <p>The body constantly adapts. If your weekly average weight gain stalls for two or more weeks, your TDEE has likely increased due to your new muscle mass and higher activity level. It's time to **increase your daily surplus by another 100-200 calories**.</p>

            <h3 className="font-semibold text-foreground mt-6">Strategies for Consuming High-Quality Calories</h3>
    <p>When bulking, eating enough high-quality food to hit the required calorie target (often 3,000 to 4,000+ calories) can be challenging. Prioritizing **calorie-dense, nutrient-rich foods** is key.</p>

            <h4 className="font-semibold text-foreground mt-4">Calorie-Dense Food Choices</h4>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Liquids:** Use high-calorie smoothies with protein powder, whole milk, oats, nut butter, and bananas to easily consume several hundred calories without feeling overly full.</li>
        <li>**Healthy Fats:** Incorporate nuts, seeds, nut butters, and avocados into meals. Fats provide 9 calories per gram, making them excellent for boosting the calorie count without adding excessive volume.</li>
        <li>**Simple Carb Sources:** Use rice, potatoes, and dried fruit to maximize energy intake, particularly around training sessions.</li>
        <li>**Meal Frequency:** Instead of forcing yourself to eat three massive meals, eat **5 to 6 smaller, nutrient-dense meals** throughout the day to support continuous muscle protein synthesis.</li>
    </ul>

            <h3 className="font-semibold text-foreground mt-6">Keys to Maximizing Muscle, Minimizing Fat</h3>
    <p>The Calorie Surplus Calculator provides the mathematical starting point for muscle gain, but success requires discipline in three areas: **nutrition, training, and rest**. Use the tool to establish your initial surplus, but rely on **consistent strength training** and **high protein intake** to ensure those extra calories are channeled into lean muscle mass, not excess fat. Regularly monitor your body composition and adjust your intake every few weeks to keep your progress steady and your bulk "lean."</p>
    
            <div className="text-sm italic text-center mt-8 pt-4 border-t">
        <p>This guide is based on established sports nutrition protocols, including research from the International Society of Sports Nutrition (ISSN), the National Academy of Sports Medicine (NASM), and the Mifflin-St Jeor equation.</p>
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
              Common questions about calorie surplus and muscle gain
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is a safe calorie surplus for bulking?</h4>
              <p className="text-muted-foreground">
                A safe calorie surplus for lean bulking is typically 250-500 calories per day above your TDEE, resulting in 0.25-0.5 kg (0.5-1 lb) of weight gain per week. Beginners can often handle 400-500 calories, while advanced lifters should use 250-300 calories to minimize fat gain. Surpluses above 500 calories/day usually just create excess fat without significantly faster muscle growth. The goal is to gain weight slowly—rapid gains are mostly fat, not muscle.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Will I gain fat during a calorie surplus?</h4>
              <p className="text-muted-foreground">
                Some fat gain is normal and expected during a bulk, but it should be minimal with a controlled surplus. With a 250-500 calorie surplus, well-structured training, and adequate protein, you can gain approximately 70-80% muscle and 20-30% fat (beginners may achieve even better ratios). If you're gaining fat faster than muscle (waist increasing rapidly, strength not improving), your surplus is too large—reduce it by 100-200 calories. The goal is "lean bulking," not "dirty bulking."
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Do I need a calorie surplus to build muscle?</h4>
              <p className="text-muted-foreground">
                Generally yes—muscle growth requires energy. However, beginners, people returning to training, or those with higher body fat can sometimes build muscle in a small deficit or at maintenance (body recomposition). Advanced lifters typically need a surplus for meaningful muscle gains. If you're very lean (below 10% body fat for men, below 18% for women), a surplus becomes more critical. Muscle protein synthesis is energy-dependent, so insufficient calories limit growth potential.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How much weight should I gain per week when bulking?</h4>
              <p className="text-muted-foreground">
                Aim for 0.25-0.5 kg (0.5-1 lb) per week, or approximately 0.5% of your body weight. For example, a 70 kg person should gain about 0.35 kg per week. Beginners may gain slightly faster initially ("newbie gains"), while advanced lifters gain more slowly. If you're gaining more than 0.5-0.7 kg per week, you're likely gaining too much fat—reduce your surplus. Track weekly averages, not daily fluctuations, as water weight can cause daily swings.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What should my macros be during a calorie surplus?</h4>
              <p className="text-muted-foreground">
                Protein: 1.6-2.2 g/kg body weight (highest priority—critical for muscle building). Carbohydrates: 45-65% of total calories (fuel for training and glycogen replenishment—important for performance). Fats: 20-30% of total calories (hormone production, including testosterone). As you increase calories, prioritize protein first, then carbs (especially around workouts), then fats. The surplus calories should mostly come from carbs and fats, not additional protein beyond your target.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How long should I bulk for?</h4>
              <p className="text-muted-foreground">
                Typical bulking phases last 3-6 months, depending on goals and starting body fat. If you're starting lean, you can bulk longer. If you're starting with higher body fat (above 15% for men, above 25% for women), consider a shorter bulk or cut first. Monitor body composition—when body fat gets too high (above 15% men, 25% women), switch to a cutting phase. Many people alternate between bulking and cutting cycles throughout the year.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I build muscle without lifting weights on a surplus?</h4>
              <p className="text-muted-foreground">
                Resistance training is essential for muscle growth—a calorie surplus alone won't build significant muscle. The surplus provides energy and building blocks, but the training stimulus (lifting weights) is what signals your body to build muscle. Without progressive resistance training, most surplus calories will be stored as fat. The combination of surplus calories + protein + strength training creates the optimal environment for muscle protein synthesis.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between a lean bulk and a dirty bulk?</h4>
              <p className="text-muted-foreground">
                A lean bulk uses a controlled, modest surplus (250-500 calories) with nutrient-dense foods, prioritizing protein and minimizing fat gain. A dirty bulk involves a very large surplus (often 1,000+ calories) with less regard for food quality, leading to rapid fat gain. Lean bulking is slower but more sustainable and requires less cutting later. Dirty bulking gains weight faster but mostly as fat, requiring longer, more difficult cutting phases. Most experts recommend lean bulking for better long-term results.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I bulk if I'm overweight?</h4>
              <p className="text-muted-foreground">
                Generally no—if you're already overweight (BMI above 25 or body fat above 15% for men, 25% for women), focus on cutting first to reduce body fat. However, beginners who are overweight can sometimes achieve body recomposition (lose fat while gaining muscle) through a small deficit, high protein, and resistance training. Once you reach a leaner state, you can then bulk more effectively. Bulking while already overweight typically just adds more fat and makes cutting later more difficult.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I know if my surplus is working?</h4>
              <p className="text-muted-foreground">
                Track multiple metrics: consistent weekly weight gain (0.25-0.5 kg), increasing strength in the gym (best indicator of muscle growth), progress photos showing muscle growth (especially arms, chest, shoulders), waist circumference (should increase slowly—rapid increases indicate excess fat), and improved workout performance. If you're gaining weight but not getting stronger or seeing muscle development, you may need to adjust your training or reduce the surplus slightly. Muscle growth is slow—be patient and consistent.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
    