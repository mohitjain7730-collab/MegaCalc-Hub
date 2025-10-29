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
import { Utensils, Info, Target, BarChart3, HelpCircle } from 'lucide-react';
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
  netCarbGoal: z.number().int().min(0).default(25),
  proteinRatio: z.number().min(0.8).max(2.2).default(1.6),
  calorieGoal: z.enum(['maintain', 'deficit', 'surplus']),
});

type FormValues = z.infer<typeof formSchema>;

interface Result {
    netCarbs: number;
    protein: number;
    fat: number;
    totalCalories: number;
}

export default function KetoMacroCalculator() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        activityLevel: '1.375',
        netCarbGoal: undefined,
        proteinRatio: undefined,
        calorieGoal: 'maintain',
    },
  });

  const onSubmit = (values: FormValues) => {
    // 1. Calculate BMR using Mifflin-St Jeor
    let bmr;
    if (values.sex === 'male') {
      bmr = (10 * values.weight) + (6.25 * values.height) - (5 * values.age) + 5;
    } else {
      bmr = (10 * values.weight) + (6.25 * values.height) - (5 * values.age) - 161;
    }
    
    // 2. Calculate TDEE
    const tdee = bmr * parseFloat(values.activityLevel);
    
    // 3. Apply calorie goal
    let targetCalories = tdee;
    if (values.calorieGoal === 'deficit') targetCalories *= 0.8; // 20% deficit
    if (values.calorieGoal === 'surplus') targetCalories *= 1.1; // 10% surplus

    // 4. Estimate Lean Body Mass (LBM) using a simplified formula (Boer)
    let lbm;
    if (values.sex === 'male') {
        lbm = (0.407 * values.weight) + (0.267 * values.height) - 19.2;
    } else {
        lbm = (0.252 * values.weight) + (0.473 * values.height) - 48.3;
    }
    
    // 5. Calculate Macros
    const netCarbs = values.netCarbGoal;
    const protein = lbm * values.proteinRatio;
    const fat = (targetCalories - (netCarbs * 4) - (protein * 4)) / 9;

    setResult({
        netCarbs: Math.round(netCarbs),
        protein: Math.round(protein),
        fat: Math.round(fat),
        totalCalories: Math.round(targetCalories),
    });
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Calculate Your Keto Macros
          </CardTitle>
          <CardDescription>
            Determine your optimal ketogenic macronutrient breakdown based on your body composition and goals
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
                <FormField control={form.control} name="activityLevel" render={({ field }) => (<FormItem><FormLabel>Activity Level</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{Object.entries(activityLevels).map(([key, value]) => <SelectItem key={key} value={String(value)}>{key.charAt(0).toUpperCase() + key.slice(1)}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                <FormField control={form.control} name="calorieGoal" render={({ field }) => (<FormItem><FormLabel>Calorie Goal</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="maintain">Maintain</SelectItem><SelectItem value="deficit">Weight Loss (20% deficit)</SelectItem><SelectItem value="surplus">Weight Gain (10% surplus)</SelectItem></SelectContent></Select></FormItem>)} />
                <FormField control={form.control} name="netCarbGoal" render={({ field }) => (<FormItem><FormLabel>Net Carb Goal (g)</FormLabel><FormControl><Input type="number" placeholder="e.g., 25" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="proteinRatio" render={({ field }) => (<FormItem><FormLabel>Protein Ratio (g/kg LBM)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="e.g., 1.6" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <Button type="submit">Calculate Keto Macros</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
            <CardHeader>
              <div className='flex items-center gap-4'>
                <Utensils className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Your Daily Keto Macros</CardTitle>
                  <CardDescription>Personalized ketogenic diet breakdown</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">Based on a target of ~{result.totalCalories} calories/day.</p>
                <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="font-bold text-xl">{result.netCarbs}g</p>
                      <p className="text-sm text-muted-foreground">Net Carbs</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="font-bold text-xl">{result.protein}g</p>
                      <p className="text-sm text-muted-foreground">Protein</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="font-bold text-xl">{result.fat}g</p>
                      <p className="text-sm text-muted-foreground">Fat</p>
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
              <h4 className="font-semibold text-foreground mb-2">Age, Sex, Weight, Height</h4>
              <p className="text-muted-foreground">
                These basic measurements are used to calculate your Basal Metabolic Rate (BMR) using the Mifflin-St Jeor equation. Your BMR represents the calories your body needs at rest, which forms the foundation for determining your keto macro targets.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Activity Level</h4>
              <p className="text-muted-foreground">
                Your activity level determines your Total Daily Energy Expenditure (TDEE) by multiplying your BMR by an activity factor. Sedentary individuals use 1.2, while very active people may use 1.725 or higher. Choose the level that best matches your typical weekly exercise and daily movement patterns.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Net Carb Goal</h4>
              <p className="text-muted-foreground">
                Net carbs (total carbohydrates minus fiber) are the key to achieving ketosis. Most people need to stay under 20-30g net carbs per day to enter and maintain ketosis. The calculator uses your specified goal and locks in this amount, allocating remaining calories to protein and fat.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Protein Ratio (g/kg LBM)</h4>
              <p className="text-muted-foreground">
                Protein needs are calculated based on your Lean Body Mass (LBM), not total weight. Common ratios range from 1.4-2.0 g/kg LBM, with higher ratios recommended for those in a calorie deficit or wanting to preserve muscle mass. The calculator estimates your LBM using body composition formulas.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Calorie Goal</h4>
              <p className="text-muted-foreground">
                Choose whether you want to maintain your current weight (TDEE), lose weight (20% deficit), or gain weight (10% surplus). These adjustments ensure your macro targets align with your goals while maintaining the keto macronutrient ratios.
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
              Explore other nutrition and diet calculators to optimize your health journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/protein-intake-calculator" className="text-primary hover:underline">
                    Protein Intake Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate your optimal protein needs to support muscle preservation on keto.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/fat-intake-calculator" className="text-primary hover:underline">
                    Fat Intake Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Understand your daily fat requirements and how they fit into your keto diet.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/carbohydrate-intake-calculator" className="text-primary hover:underline">
                    Carbohydrate Intake Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Learn about carbohydrate needs for different activity levels and goals.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary hover:underline">
                    Daily Calorie Needs Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate your Total Daily Energy Expenditure to understand your baseline calorie needs.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/macro-ratio-calculator" className="text-primary hover:underline">
                    Macro Ratio Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  See how different macronutrient ratios compare to your keto targets.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/intermittent-fasting-calculator" className="text-primary hover:underline">
                    Intermittent Fasting Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Combine keto with intermittent fasting for enhanced results.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              Complete Guide to Keto Macros
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h2 className="text-xl font-bold text-foreground">How to Set Your Keto Macros (That Actually Work)</h2>
            <p>Keto is not just "eat bacon." Effective ketogenic diets prioritize <strong>adequate protein</strong>, a consistent <strong>low net‑carb target</strong>, and use <strong>fat</strong> to reach calories.
              This calculator builds around those principles. Use the guidance below to implement day‑to‑day.</p>

            <h3 className="font-semibold text-foreground mt-6">1) Net Carbs: Keep It Low and Consistent</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Common starting point: <strong>20–30 g net carbs</strong> per day (fiber excluded).</li>
              <li>Spread across meals to stabilize hunger and glucose; reserve more of your daily carbs around training if desired.</li>
              <li>Track hidden carbs in sauces, dressings, and processed "keto" snacks.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">2) Protein: The Anchor</h3>
            <p>Base protein on lean body mass (LBM) or target bodyweight: typically <strong>1.4–2.0 g/kg LBM</strong> (≈ <strong>0.6–0.9 g/lb LBM</strong>) to preserve muscle.</p>

            <h3 className="font-semibold text-foreground mt-6">3) Fat: The Calorie Lever</h3>
            <p>After net carbs and protein are set, <strong>fat fills the rest of your calories</strong>. In a deficit, fat grams will be lower; in maintenance or surplus, higher.</p>

            <h3 className="font-semibold text-foreground mt-6">4) Electrolytes, Fiber, and Micronutrients</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Sodium:</strong> 3–5 g/day from broths, salted meals—especially during adaptation.</li>
              <li><strong>Potassium & Magnesium:</strong> leafy greens, avocado, nuts/seeds; consider supplements if intake is low.</li>
              <li><strong>Fiber:</strong> 20–30 g/day from non‑starchy vegetables, chia/flax, low‑sugar berries; fiber does not count toward net carbs.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">5) Plate Examples</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Egg omelet + spinach + feta + olive oil; side of avocado.</li>
              <li>Salmon + asparagus + herb butter; mixed greens with olive‑oil vinaigrette.</li>
              <li>Tofu stir‑fry in coconut oil with broccoli, mushrooms, and sesame seeds.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">Keto Basics: What and Why</h3>
            <p>
              Nutritional ketosis is a metabolic state where ketone bodies provide a significant share of fuel. People choose keto for
              appetite control, steady energy, or therapeutic reasons. Success hinges on <strong>consistency</strong> and <strong>nutrient‑dense food choices</strong>—not
              unlimited fat.
            </p>

            <h3 className="font-semibold text-foreground mt-6">Common Mistakes</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Under‑eating protein and over‑relying on added fats.</li>
              <li>Ignoring electrolytes, leading to headaches or fatigue.</li>
              <li>Assuming all "keto snacks" fit your goals—many are high‑calorie and low in micronutrients.</li>
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
              Common questions about ketogenic macros and the keto diet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Do I need to be in ketosis to lose fat?</h4>
              <p className="text-muted-foreground">
                No—calorie balance still governs fat loss. Keto is one tool among many. While ketosis can help with appetite control and steady energy, the primary driver of weight loss is creating a calorie deficit. Many people find keto easier to maintain because fat and protein are more satiating than carbohydrates.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I handle social meals on keto?</h4>
              <p className="text-muted-foreground">
                Center the plate on protein + low‑starch vegetables; bring a dressing/olive oil if needed. When dining out, choose grilled meats, salads with oil-based dressings, or vegetable sides. Don't be afraid to ask for modifications—most restaurants are accommodating. Planning ahead and eating a small keto-friendly snack before social events can also help.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Will keto hurt my workout performance?</h4>
              <p className="text-muted-foreground">
                For high‑intensity sports, many perform better with strategic carbs; for steady‑state, keto can feel fine once adapted. During the initial adaptation phase (first 2-4 weeks), you may experience reduced performance, especially in high-intensity activities. However, once fat-adapted, many athletes perform well, especially in endurance activities. Some athletes use targeted keto (adding carbs around workouts) to optimize performance.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I eat too much protein on keto?</h4>
              <p className="text-muted-foreground">
                Very high protein intake (above 2.2 g/kg LBM) may reduce ketone production in some people through gluconeogenesis. However, for most people following a standard keto diet, the protein amounts calculated by this tool (1.4-2.0 g/kg LBM) are optimal and won't interfere with ketosis. Protein is crucial for muscle preservation, especially in a calorie deficit.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What are net carbs vs total carbs?</h4>
              <p className="text-muted-foreground">
                Net carbs = total carbohydrates minus fiber (and sometimes sugar alcohols). Fiber doesn't raise blood sugar or insulin, so it doesn't count toward your keto carb limit. For example, if a food has 10g total carbs and 6g fiber, it has 4g net carbs. Most keto dieters aim for 20-30g net carbs per day to maintain ketosis.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Do I need to track all macros or just carbs?</h4>
              <p className="text-muted-foreground">
                For best results, especially in the beginning, track all three macros (carbs, protein, fat). While carbs are most critical for ketosis, protein is essential for muscle preservation, and fat helps you hit your calorie target. Many experienced keto dieters can "eyeball" portions after a few weeks, but tracking ensures accuracy, especially when first starting or when progress stalls.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I know if I'm in ketosis?</h4>
              <p className="text-muted-foreground">
                Common signs include: reduced appetite, increased mental clarity, more stable energy, "keto breath" (a fruity or metallic taste), and increased thirst. You can test ketone levels using urine strips (least accurate), blood meters (most accurate), or breath analyzers (moderate accuracy). However, these aren't necessary—if you're eating under 20-30g net carbs consistently, you're likely in ketosis.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I drink alcohol on keto?</h4>
              <p className="text-muted-foreground">
                Yes, but with caveats. Dry wines, spirits (vodka, whiskey, gin), and low-carb beers can fit within your net carb limit. However, alcohol pauses fat burning as your body prioritizes metabolizing alcohol. Also, alcohol tolerance is often lower on keto. Drink in moderation, stay hydrated, and account for alcohol calories (7 calories per gram) in your daily totals.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What is the "keto flu" and how do I avoid it?</h4>
              <p className="text-muted-foreground">
                "Keto flu" refers to flu-like symptoms (fatigue, headaches, irritability) during the first week of keto adaptation. It's caused by electrolyte imbalances and dehydration as your body adjusts. To minimize it: consume plenty of sodium (3-5g/day), stay hydrated, get adequate potassium and magnesium from foods or supplements, and don't go too low on calories during adaptation.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Is keto safe long-term?</h4>
              <p className="text-muted-foreground">
                For most healthy individuals, keto can be safe long-term when done properly with a focus on whole foods, adequate protein, and micronutrient intake. However, some populations (pregnant/breastfeeding women, people with certain medical conditions, children) should avoid or modify keto. Consult with a healthcare provider before starting, especially if you have diabetes, kidney issues, or other medical conditions. Regular monitoring and a balanced approach are key.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
