
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
import { Utensils } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { EmbedWidget } from '@/components/embed-widget';

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
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Utensils className="h-8 w-8 text-primary" /><CardTitle>Your Daily Keto Macros</CardTitle></div></CardHeader>
            <CardContent className="text-center">
                <p className="text-muted-foreground">Based on a target of ~{result.totalCalories} calories/day.</p>
                <div className="grid grid-cols-3 gap-4 mt-4">
                    <div><p className="font-bold text-xl">{result.netCarbs}g</p><p>Net Carbs</p></div>
                    <div><p className="font-bold text-xl">{result.protein}g</p><p>Protein</p></div>
                    <div><p className="font-bold text-xl">{result.fat}g</p><p>Fat</p></div>
                </div>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator provides a macronutrient breakdown for a ketogenic diet based on your body composition and goals.</p>
                <ol className="list-decimal list-inside space-y-2">
                  <li><strong>Calorie Target:</strong> It first calculates your maintenance calories (TDEE) and adjusts it based on your goal (maintain, loss, or gain).</li>
                  <li><strong>Lean Body Mass (LBM):</strong> It estimates your LBM using a formula, as protein requirements are best based on lean tissue.</li>
                  <li><strong>Macronutrients:</strong>
                    <ul className="list-disc list-inside ml-4">
                        <li><strong>Carbs:</strong> Set to your specified fixed gram amount to promote ketosis.</li>
                        <li><strong>Protein:</strong> Calculated based on your LBM and protein ratio to preserve muscle mass.</li>
                        <li><strong>Fat:</strong> The remaining calories are allocated to fat, which serves as the primary energy source on a keto diet.</li>
                    </ul>
                  </li>
                </ol>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
      <section
        className="space-y-4 text-muted-foreground leading-relaxed"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="headline" content="Keto Macro Calculator – Complete Guide to Ketogenic Macros" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Set keto macros with science: net carbs, protein by lean body mass, fat as a calorie lever. Electrolytes, fiber, hidden carbs, and plate examples." />

        <h2 itemProp="name" className="text-xl font-bold text-foreground">How to Set Your Keto Macros (That Actually Work)</h2>
        <p itemProp="description">Keto is not just “eat bacon.” Effective ketogenic diets prioritize <strong>adequate protein</strong>, a consistent <strong>low net‑carb target</strong>, and use <strong>fat</strong> to reach calories.
          This calculator builds around those principles. Use the guidance below to implement day‑to‑day.</p>

        <h3 className="font-semibold text-foreground mt-6">1) Net Carbs: Keep It Low and Consistent</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Common starting point: <strong>20–30 g net carbs</strong> per day (fiber excluded).</li>
          <li>Spread across meals to stabilize hunger and glucose; reserve more of your daily carbs around training if desired.</li>
          <li>Track hidden carbs in sauces, dressings, and processed “keto” snacks.</li>
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

        <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
        <div className="space-y-2">
          <p><Link href="/category/health-fitness/protein-intake-calculator" className="text-primary underline">Protein Intake Calculator</Link></p>
          <p><Link href="/category/health-fitness/fat-intake-calculator" className="text-primary underline">Fat Intake Calculator</Link></p>
          <p><Link href="/category/health-fitness/carbohydrate-intake-calculator" className="text-primary underline">Carbohydrate Intake Calculator</Link></p>
        </div>

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
          <li>Assuming all “keto snacks” fit your goals—many are high‑calorie and low in micronutrients.</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">FAQ</h3>
        <div className="space-y-3">
          <p><strong>Do I need to be in ketosis to lose fat?</strong> No—calorie balance still governs fat loss. Keto is one tool among many.</p>
          <p><strong>How do I handle social meals?</strong> Center the plate on protein + low‑starch vegetables; bring a dressing/olive oil if needed.</p>
          <p><strong>Will keto hurt performance?</strong> For high‑intensity sports, many perform better with strategic carbs; for steady‑state, keto can feel fine once adapted.</p>
        </div>
      </section>
      
      <EmbedWidget calculatorSlug="keto-macro-calculator" calculatorName="Keto Macro Calculator" />
    </div>
  );
}
