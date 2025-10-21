
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
import { TrendingDown } from 'lucide-react';
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
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><TrendingDown className="h-8 w-8 text-primary" /><CardTitle>Target Daily Calories</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.toFixed(0)}</p>
                    <CardDescription>This is your estimated daily calorie intake for your weight loss goal.</CardDescription>
                    {result < 1200 && <p className="text-red-500 text-sm mt-2">Warning: Intake below 1200 calories may be unsafe without medical supervision.</p>}
                </div>
            </CardContent>
        </Card>
      )}
       <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
    <meta itemProp="headline" content="Calorie Deficit Calculator Guide: Calculating BMR, TDEE, and a Safe Deficit for Weight Loss" />
    <meta itemProp="author" content="Your Website/Health Team Name" />
    <meta itemProp="about" content="A comprehensive guide to using a Calorie Deficit Calculator, explaining the formulas for Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE), and setting a safe, sustainable 500-calorie deficit for weight loss and fat loss." />

    <h1 className="text-2xl font-bold text-foreground mb-4">The Ultimate Calorie Deficit Calculator Guide: Fueling Safe, Sustainable Weight Loss</h1>
    
    <p><em><strong>Disclaimer:</strong> This guide provides educational content based on scientific and nutritional guidelines. Consult a physician or registered dietitian before starting any restrictive diet or exercise program, especially if you have pre-existing health conditions or are taking medication.</em></p>

    <h2 className="text-xl font-bold text-foreground mt-8">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-1">
        <li><a href="#intro">The Law of Energy Balance: What is a Calorie Deficit?</a></li>
        <li><a href="#bmr-tdee">The Calculation Core: BMR and TDEE Explained</a></li>
        <li><a href="#safe-deficit">The Gold Standard: Calculating Your Safe Calorie Deficit</a></li>
        <li><a href="#macronutrients">Macronutrients: Optimizing Your Deficit for Fat Loss and Muscle Preservation</a></li>
        <li><a href="#strategies">Actionable Strategies for Creating a Deficit (Diet vs. Exercise)</a></li>
        <li><a href="#pitfalls">Weight Loss Pitfalls: Avoiding Metabolic Slowdown and Withdrawal</a></li>
        <li><a href="#conclusion">Keys to Long-Term, Sustainable Success</a></li>
    </ul>

    <h2 id="intro" itemProp="name" className="text-xl font-bold text-foreground mt-8">The Law of Energy Balance: What is a Calorie Deficit?</h2>
    <p itemProp="description">Weight management ultimately adheres to the law of thermodynamics: **energy balance**. A **calorie deficit** occurs when you consistently consume fewer calories (energy in) than your body expends (energy out). When this deficit is created, your body is forced to use stored energy—primarily body fat—to meet its energy needs, resulting in weight loss.</p>
    
    <p>The Calorie Deficit Calculator is the tool that quantifies this crucial balance. It takes your unique physiological data (age, sex, height, weight) and activity level to estimate your daily energy needs, giving you a precise number to target for safe and effective weight loss.</p>
    
    <h3 className="font-semibold text-foreground mt-6">The Fat Loss Equation</h3>
    <p>The generally accepted rule of thumb is that **1 pound (0.45 kg) of body fat contains roughly 3,500 calories**. Therefore, to lose 1 pound per week, you need to establish a cumulative weekly deficit of 3,500 calories, or a consistent daily deficit of 500 calories.</p>
    <pre><code>Daily Calorie Deficit = Total Daily Energy Expenditure (TDEE) &minus; Target Calorie Intake</code></pre>

    <h2 id="bmr-tdee" className="text-xl font-bold text-foreground mt-8">The Calculation Core: BMR and TDEE Explained</h2>
    <p>The calculator works in two distinct stages to determine your energy expenditure:</p>

    <h3 className="font-semibold text-foreground mt-6">Stage 1: Basal Metabolic Rate (BMR)</h3>
    <p>BMR is the minimum number of calories your body needs to maintain basic, life-sustaining functions (like breathing, circulation, and temperature regulation) while at complete rest. It accounts for **60% to 75%** of the total calories you burn daily.</p>
    <p>The calculator typically uses the highly accurate **Mifflin-St Jeor Equation** to estimate BMR:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Men:** (10 &times; weight in kg) + (6.25 &times; height in cm) &minus; (5 &times; age in years) + 5</li>
        <li>**Women:** (10 &times; weight in kg) + (6.25 &times; height in cm) &minus; (5 &times; age in years) &minus; 161</li>
    </ul>
    
    <h3 className="font-semibold text-foreground mt-6">Stage 2: Total Daily Energy Expenditure (TDEE)</h3>
    <p>TDEE is the total number of calories you burn over a 24-hour period, representing your **maintenance calories** (the calories needed to stay at your current weight). TDEE includes:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**BMR** (Basal Metabolic Rate)</li>
        <li>**NEAT** (Non-Exercise Activity Thermogenesis: fidgeting, standing, walking)</li>
        <li>**TEA** (Thermic Effect of Activity: planned exercise)</li>
        <li>**TEF** (Thermic Effect of Food: energy used for digestion, roughly 10% of total calories)</li>
    </ul>
    
    <p>The calculator determines TDEE by multiplying BMR by an **Activity Factor** based on your lifestyle:</p>
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Activity Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Multiplier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Description</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300">Sedentary</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">1.2</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Little to no exercise, desk job.</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300">Lightly Active</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">1.375</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Light exercise 1-3 days per week.</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300">Moderately Active</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">1.55</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Moderate exercise 3-5 days per week.</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300">Very Active</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">1.725</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Hard exercise 6-7 days per week.</td>
                </tr>
            </tbody>
        </table>
    </div>

    <h2 id="safe-deficit" className="text-xl font-bold text-foreground mt-8">The Gold Standard: Calculating Your Safe Calorie Deficit</h2>
    <p>The goal is to find the **sweet spot**—a deficit large enough to promote fat loss, but small enough to be sustainable without causing muscle loss or extreme fatigue.</p>

    <h3 className="font-semibold text-foreground mt-6">The Recommended Daily Deficit</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Target Weight Loss:** 1 to 2 pounds (0.45 to 0.9 kg) per week.</li>
        <li>**Target Deficit:** **500 to 1,000 calories per day** subtracted from your TDEE.</li>
    </ul>
    
    <p>A **500-calorie deficit** is often recommended as the starting point for most people, as it results in the safe loss of about 1 pound per week. A 1,000-calorie deficit should generally only be used by individuals with a high TDEE (high body weight or high activity level) to ensure total intake does not drop below critical minimums.</p>

    <h3 className="font-semibold text-foreground mt-6">Minimum Calorie Intake Thresholds</h3>
    <p>Consuming too few calories can lead to nutrient deficiencies, loss of muscle mass, and metabolic slowdown. The calculator should flag if your resulting goal falls below these minimums:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Absolute Minimum for Women:** 1,200 calories per day</li>
        <li>**Absolute Minimum for Men:** 1,500 calories per day</li>
    </ul>

    <h2 id="macronutrients" className="text-xl font-bold text-foreground mt-8">Macronutrients: Optimizing Your Deficit for Fat Loss and Muscle Preservation</h2>
    <p>A successful calorie deficit is not just about the total number; it's about the **quality and composition** of those calories. Strategic macronutrient planning ensures your body burns fat while protecting muscle mass.</p>

    <h3 className="font-semibold text-foreground mt-6">Protein: The Muscle Preserver</h3>
    <p>Protein is the most important macronutrient during a calorie deficit because it has the highest **Thermic Effect of Food (TEF)** (burning more calories during digestion) and is essential for muscle repair.</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Goal:** Aim for a high-protein intake, typically **1.4 to 2.2 grams per kilogram (kg)** of body weight, especially if you are strength training.</li>
        <li>**Benefit:** High protein maximizes satiety (feeling full) and minimizes muscle loss.</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">Carbohydrates and Fats</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Carbohydrates:** Focus on complex carbohydrates (whole grains, fruits, vegetables) and fiber. Carbs should typically account for **45%–65%** of total calories, adjusted based on activity level.</li>
        <li>**Fats:** Healthy fats (avocados, nuts, olive oil) are vital for hormone production and nutrient absorption. Aim for **20%–35%** of total calories, ensuring at least **0.5 grams per kg of body weight** to avoid deficiency.</li>
    </ul>

    <h2 id="strategies" className="text-xl font-bold text-foreground mt-8">Actionable Strategies for Creating a Deficit (Diet vs. Exercise)</h2>
    <p>The most sustainable weight loss programs combine dietary reduction with increased physical activity.</p>

    <h3 className="font-semibold text-foreground mt-6">Dietary Reduction (The Primary Lever)</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Cut Liquid Calories:** Eliminate high-calorie beverages like sodas, sugary juices, and cream-heavy coffee drinks. Swapping a 250-calorie soda for water immediately creates a significant deficit.</li>
        <li>**Increase Volume, Reduce Density:** Prioritize whole foods rich in fiber and water (vegetables, fruits, lean protein) over calorie-dense, processed foods. This helps maximize fullness on fewer calories.</li>
        <li>**Practice Portion Control:** Use a food scale or measuring cups, especially in the initial tracking phase, to ensure accurate counting. **Underestimating food intake is the #1 reason diets fail.**</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">Activity Increase (The Secondary Lever)</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Targeted Exercise:** Engage in **150 minutes of moderate-intensity aerobic activity** per week. This directly increases your TDEE.</li>
        <li>**Build Muscle:** Incorporate **strength training** (2-3 days per week). Muscle tissue is metabolically active, boosting your BMR and helping you burn more calories even at rest.</li>
        <li>**Increase NEAT:** Actively increase Non-Exercise Activity Thermogenesis (NEAT) by taking the stairs, walking during calls, or fidgeting more. This small, consistent energy expenditure can add hundreds of calories to your deficit over the course of a week.</li>
    </ul>

    <h2 id="pitfalls" className="text-xl font-bold text-foreground mt-8">Weight Loss Pitfalls: Avoiding Metabolic Slowdown and Withdrawal</h2>
    <p>Long-term success requires adapting to the body's natural response to a sustained calorie deficit.</p>

    <h3 className="font-semibold text-foreground mt-6">Managing Metabolic Adaptation</h3>
    <p>If you stay in a calorie deficit for too long, your body may initiate **metabolic adaptation** (often inaccurately called "starvation mode"). This is a protective mechanism where the body lowers the TDEE (making it harder to lose weight) to conserve energy.</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Re-evaluation:** Your maintenance calories (TDEE) decrease as you lose weight. Recalculate your TDEE every **4-6 weeks** and adjust your target intake accordingly.</li>
        <li>**Diet Breaks:** Consider occasional, controlled "diet breaks" where you temporarily eat at maintenance calories for 1–2 weeks to mitigate the metabolic slowdown effect.</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">Symptoms of an Unhealthy Deficit</h3>
    <p>If you experience any of the following, your calorie deficit is too aggressive and should be increased immediately:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Extreme, persistent fatigue and lethargy.</li>
        <li>Hair loss or brittle nails.</li>
        <li>Loss of menstrual period (in women).</li>
        <li>Chronic irritability, mood swings, or "hangriness."</li>
        <li>Rapid weight loss exceeding 2 pounds per week (after the initial water weight loss phase).</li>
    </ul>

    <h2 id="conclusion" className="text-xl font-bold text-foreground mt-8">Keys to Long-Term, Sustainable Success</h2>
    <p>The Calorie Deficit Calculator provides a number, but a successful weight loss journey requires a commitment to new habits and a holistic view of health. Focus on nutrient-rich whole foods, consistent physical activity, adequate sleep, and stress management to ensure your deficit is healthy, sustainable, and leads to permanent results.</p>
    
    <div className="text-sm italic text-center mt-8 pt-4 border-t border-gray-200">
        <p>This guide is based on established nutritional and metabolic science, referencing guidelines from the National Academy of Sports Medicine (NASM), the CDC, and the Mifflin-St Jeor equation for BMR calculation.</p>
    </div>
</section>
    </div>
  );
}

    