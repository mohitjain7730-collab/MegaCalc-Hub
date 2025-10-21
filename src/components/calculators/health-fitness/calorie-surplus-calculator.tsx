
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
import { TrendingUp } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><TrendingUp className="h-8 w-8 text-primary" /><CardTitle>Target Daily Calories</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.toFixed(0)}</p>
                    <CardDescription>Combine with resistance training to promote muscle gain.</CardDescription>
                </div>
            </CardContent>
        </Card>
      )}
       <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
    <meta itemProp="headline" content="Calorie Surplus Calculator Guide: TDEE, Lean Bulking, and Macronutrients for Muscle Gain" />
    <meta itemProp="author" content="Your Website/Health Team Name" />
    <meta itemProp="about" content="A comprehensive guide to calculating the Calorie Surplus required for muscle gain (bulking), focusing on the TDEE calculation, setting a safe 250-500 calorie surplus to minimize fat gain, and optimizing protein intake for muscle synthesis." />

    <h1 className="text-2xl font-bold text-foreground mb-4">The Ultimate Calorie Surplus Calculator Guide: Fueling Muscle Gain (Lean Bulking)</h1>
    
    <p><em><strong>Disclaimer:</strong> This guide provides educational information based on sports nutrition and physiological science. It is not a substitute for medical advice. Consult a healthcare provider or registered dietitian before beginning a hypercaloric diet, especially if you have pre-existing health conditions.</em></p>

    <h2 className="text-xl font-bold text-foreground mt-8">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-1">
        <li><a href="#intro">What is a Calorie Surplus? The Anabolic Requirement</a></li>
        <li><a href="#tdee">Calculating the Foundation: BMR and Total Daily Energy Expenditure (TDEE)</a></li>
        <li><a href="#safe-surplus">The Lean Bulk Zone: Determining Your Safe Calorie Surplus (250-500 kcal)</a></li>
        <li><a href="#macronutrients">Macronutrient Strategy for Hypercaloric Diets</a></li>
        <li><a href="#gain-rate">Monitoring Progress: The Optimal Rate of Weight Gain</a></li>
        <li><a href="#strategies">Strategies for Consuming High-Quality Calories</a></li>
        <li><a href="#conclusion">Keys to Maximizing Muscle, Minimizing Fat</a></li>
    </ul>

    <h2 id="intro" itemProp="name" className="text-xl font-bold text-foreground mt-8">What is a Calorie Surplus? The Anabolic Requirement</h2>
    <p itemProp="description">A **Calorie Surplus** is the opposite of a calorie deficit: it occurs when you consistently consume more calories (energy in) than your body burns (energy out). For those aiming to increase body weight in the form of muscle mass—a process often called **bulking**—a surplus is non-negotiable. Without extra energy, the body cannot support the intense anabolic (building) processes required for **Muscle Protein Synthesis (MPS)** that occurs after resistance training.</p>
    
    <p>The **Calorie Surplus Calculator** is an essential tool that defines your energy baseline and recommends the precise number of extra calories needed to initiate muscle growth while simultaneously preventing excessive, unwanted fat accumulation (a common mistake known as a "dirty bulk").</p>

    <h2 id="tdee" className="text-xl font-bold text-foreground mt-8">Calculating the Foundation: BMR and Total Daily Energy Expenditure (TDEE)</h2>
    <p>Before establishing a surplus, you must first accurately determine your **Maintenance Calories**, or the total energy you burn daily (TDEE).</p>

    <h3 className="font-semibold text-foreground mt-6">Stage 1: Basal Metabolic Rate (BMR)</h3>
    <p>BMR is the base amount of energy your body requires to function at rest. The calculator uses physiological data (age, height, weight) with the reliable **Mifflin-St Jeor Equation**:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Men:** (10 &times; weight in kg) + (6.25 &times; height in cm) &minus; (5 &times; age in years) + 5</li>
        <li>**Women:** (10 &times; weight in kg) + (6.25 &times; height in cm) &minus; (5 &times; age in years) &minus; 161</li>
    </ul>
    
    <h3 className="font-semibold text-foreground mt-6">Stage 2: Total Daily Energy Expenditure (TDEE)</h3>
    <p>Your **TDEE** (Maintenance Calories) is calculated by multiplying your BMR by an activity factor (PAL), which accounts for your job, daily movements, and structured exercise:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Sedentary:** BMR &times; 1.2</li>
        <li>**Moderately Active:** BMR &times; 1.55 (Typically the correct factor for those lifting weights 3-5 times per week)</li>
        <li>**Very Active:** BMR &times; 1.725 (For individuals lifting 6-7 times per week or those with physically demanding jobs)</li>
    </ul>
    <p>***The TDEE is your starting line. Any calories consumed above this number create the surplus.***</p>

    <h2 id="safe-surplus" className="text-xl font-bold text-foreground mt-8">The Lean Bulk Zone: Determining Your Safe Calorie Surplus (250-500 kcal)</h2>
    <p>The goal of a **lean bulk** is to maximize muscle gain while minimizing fat gain. This requires a carefully controlled, modest surplus. Too large a surplus will simply be stored as body fat, as muscle growth is a slow physiological process that cannot be rushed.</p>

    <h3 className="font-semibold text-foreground mt-6">Optimal Surplus Recommendations</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**General Starting Point:** Add **250 to 500 calories** per day to your TDEE. This typically supports a weight gain of **0.5 to 1.0 pound (0.25 to 0.5 kg) per week**.</li>
        <li>**Beginners (Untrained):** Because beginners experience rapid muscle growth ("newbie gains"), they can tolerate the higher end of the surplus (400-500 calories) with less risk of fat gain.</li>
        <li>**Advanced Lifters (Trained):** Experienced lifters should aim for a more conservative surplus (250-300 calories) to minimize fat gain, as muscle protein synthesis slows down once genetic potential is approached.</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">Why A Controlled Surplus is Key</h3>
    <p>Studies have shown that exceeding a moderate calorie surplus (e.g., adding 1000+ calories daily) does not significantly increase the rate of muscle growth but drastically increases the rate of fat storage. The body has a finite speed at which it can build muscle; the excess energy beyond that capacity becomes fat.</p>

    <h2 id="macronutrients" className="text-xl font-bold text-foreground mt-8">Macronutrient Strategy for Hypercaloric Diets</h2>
    <p>In a calorie surplus, the source of the calories matters more than ever. The macronutrient ratio must be optimized to prioritize **Muscle Protein Synthesis (MPS)** and fuel high-intensity training.</p>

    <h3 className="font-semibold text-foreground mt-6">Protein: The Primary Anabolic Driver</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Goal:** **1.6 to 2.2 grams of protein per kilogram (kg) of body weight** per day. This is critical for repairing muscle tissue damaged during resistance training.</li>
        <li>**Application:** Ensure protein intake is consistent and spread evenly across 4-6 meals to optimize the "muscle building window" throughout the day.</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">Carbohydrates: Fuel and Glycogen Replenishment</h3>
    <p>Carbohydrates are the body's preferred fuel source, particularly for the high-intensity nature of weightlifting. Adequate carbohydrate intake replenishes muscle **glycogen stores**, which are essential for maintaining strength and training volume.</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Goal:** Carbs should make up the majority of remaining calories, typically **45% to 65%** of TDEE plus surplus.</li>
        <li>**Quality:** Focus on complex, whole-food sources like whole grains, rice, potatoes, and fruits.</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">Fats: Hormonal Health and Energy Density</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Goal:** Fats should account for **20% to 30%** of total daily calories.</li>
        <li>**Role:** Fats are vital for the production of critical muscle-building hormones, including **testosterone**. Focus on unsaturated sources (nuts, avocados, olive oil) while limiting saturated fat.</li>
    </ul>

    <h2 id="gain-rate" className="text-xl font-bold text-foreground mt-8">Monitoring Progress: The Optimal Rate of Weight Gain</h2>
    <p>Since the goal is to gain muscle, not just fat, continuous tracking and adjustment of the calorie surplus are essential. If you are gaining too quickly, you are likely accumulating excessive fat mass, and the surplus needs to be reduced.</p>

    <h3 className="font-semibold text-foreground mt-6">Tracking Metrics</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Scale Weight:** Weigh yourself daily (in the morning, before eating) and track the weekly average. Aim for **0.5% of your body weight gain per week** (e.g., a 200 lb person should gain about 1 lb/week).</li>
        <li>**Visual Assessment:** Use progress photos (taken weekly) and circumference measurements (waist, arms, chest) to monitor where the weight is being gained. If your waist circumference increases too rapidly, reduce the surplus.</li>
        <li>**Strength Progression:** Consistent increases in strength and training volume in the gym are the best indicators that the surplus is being utilized for **muscle anabolism**.</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">When to Adjust the Surplus</h3>
    <p>The body constantly adapts. If your weekly average weight gain stalls for two or more weeks, your TDEE has likely increased due to your new muscle mass and higher activity level. It's time to **increase your daily surplus by another 100-200 calories**.</p>

    <h2 id="strategies" className="text-xl font-bold text-foreground mt-8">Strategies for Consuming High-Quality Calories</h2>
    <p>When bulking, eating enough high-quality food to hit the required calorie target (often 3,000 to 4,000+ calories) can be challenging. Prioritizing **calorie-dense, nutrient-rich foods** is key.</p>

    <h3 className="font-semibold text-foreground mt-6">Calorie-Dense Food Choices</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Liquids:** Use high-calorie smoothies with protein powder, whole milk, oats, nut butter, and bananas to easily consume several hundred calories without feeling overly full.</li>
        <li>**Healthy Fats:** Incorporate nuts, seeds, nut butters, and avocados into meals. Fats provide 9 calories per gram, making them excellent for boosting the calorie count without adding excessive volume.</li>
        <li>**Simple Carb Sources:** Use rice, potatoes, and dried fruit to maximize energy intake, particularly around training sessions.</li>
        <li>**Meal Frequency:** Instead of forcing yourself to eat three massive meals, eat **5 to 6 smaller, nutrient-dense meals** throughout the day to support continuous muscle protein synthesis.</li>
    </ul>

    <h2 id="conclusion" className="text-xl font-bold text-foreground mt-8">Keys to Maximizing Muscle, Minimizing Fat</h2>
    <p>The Calorie Surplus Calculator provides the mathematical starting point for muscle gain, but success requires discipline in three areas: **nutrition, training, and rest**. Use the tool to establish your initial surplus, but rely on **consistent strength training** and **high protein intake** to ensure those extra calories are channeled into lean muscle mass, not excess fat. Regularly monitor your body composition and adjust your intake every few weeks to keep your progress steady and your bulk "lean."</p>
    
    <div className="text-sm italic text-center mt-8 pt-4 border-t border-gray-200">
        <p>This guide is based on established sports nutrition protocols, including research from the International Society of Sports Nutrition (ISSN), the National Academy of Sports Medicine (NASM), and the Mifflin-St Jeor equation.</p>
    </div>
</section>
    </div>
  );
}

    