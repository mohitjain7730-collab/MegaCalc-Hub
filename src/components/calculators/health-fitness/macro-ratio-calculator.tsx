
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart as PieChartIcon } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const formSchema = z.object({
  tdee: z.number().positive(),
  proteinPercent: z.number().min(0).max(100),
  carbPercent: z.number().min(0).max(100),
  fatPercent: z.number().min(0).max(100),
}).refine(data => Math.abs(data.proteinPercent + data.carbPercent + data.fatPercent - 100) < 1, {
    message: "Percentages must add up to 100%.",
    path: ["fatPercent"],
});

type FormValues = z.infer<typeof formSchema>;

interface Result {
    protein: number;
    carbs: number;
    fat: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

export default function MacroRatioCalculator() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        tdee: undefined,
        proteinPercent: 30,
        carbPercent: 40,
        fatPercent: 30,
    },
  });

  const onSubmit = (values: FormValues) => {
    const proteinGrams = (values.tdee * (values.proteinPercent / 100)) / 4;
    const carbGrams = (values.tdee * (values.carbPercent / 100)) / 4;
    const fatGrams = (values.tdee * (values.fatPercent / 100)) / 9;
    setResult({ protein: proteinGrams, carbs: carbGrams, fat: fatGrams });
  };
  
  const protein = form.watch('proteinPercent');
  const carbs = form.watch('carbPercent');
  const fat = form.watch('fatPercent');

  const chartData = result ? [
    { name: 'Protein', value: result.protein },
    { name: 'Carbs', value: result.carbs },
    { name: 'Fat', value: result.fat },
  ] : [];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="tdee"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>Total Daily Calories (TDEE)</FormLabel>
                  <Link href="/category/health-fitness/daily-calorie-needs-calculator" className="text-xs text-primary underline">
                    (Calculate)
                  </Link>
                </div>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="space-y-6">
            <FormField control={form.control} name="proteinPercent" render={({ field }) => (
                <FormItem>
                    <FormLabel>Protein: {protein}%</FormLabel>
                    <FormControl><Slider defaultValue={[30]} min={0} max={100} step={5} onValueChange={(vals) => field.onChange(vals[0])} /></FormControl>
                </FormItem>
            )} />
             <FormField control={form.control} name="carbPercent" render={({ field }) => (
                <FormItem>
                    <FormLabel>Carbohydrates: {carbs}%</FormLabel>
                    <FormControl><Slider defaultValue={[40]} min={0} max={100} step={5} onValueChange={(vals) => field.onChange(vals[0])} /></FormControl>
                </FormItem>
            )} />
            <FormField control={form.control} name="fatPercent" render={({ field }) => (
                <FormItem>
                    <FormLabel>Fat: {fat}%</FormLabel>
                    <FormControl><Slider defaultValue={[30]} min={0} max={100} step={5} onValueChange={(vals) => field.onChange(vals[0])} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Macros</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><PieChartIcon className="h-8 w-8 text-primary" /><CardTitle>Your Daily Macronutrient Goals</CardTitle></div></CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                        <div>
                            <p className="text-muted-foreground">Protein</p>
                            <p className="text-2xl font-bold">{result.protein.toFixed(0)}g</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Carbohydrates</p>
                            <p className="text-2xl font-bold">{result.carbs.toFixed(0)}g</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Fat</p>
                            <p className="text-2xl font-bold">{result.fat.toFixed(0)}g</p>
                        </div>
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={chartData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `${value.toFixed(0)}g`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                </div>
            </CardContent>
        </Card>
      )}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-2">How It Works</h3>
        <div className="text-muted-foreground">
            <p>This calculator divides your total daily calories into grams for each macronutrient. It uses the standard caloric values: 4 calories per gram of protein, 4 calories per gram of carbohydrate, and 9 calories per gram of fat. Based on your desired percentages, it calculates the target gram amount for each macro to meet your daily calorie goal.</p>
        </div>
      </div>
      <div className="space-y-4">
        <h3 className='font-bold text-xl'>Macro Ratio Calculator — Find the Best Carb / Protein / Fat Split for Your Goals</h3>
        <p className="text-muted-foreground">A Macro Ratio Calculator helps you determine how many grams of carbohydrates, protein, and fats you should eat each day based on your calorie target and goals (fat loss, muscle gain, or maintenance). Unlike calorie counting alone, tracking macros ensures you get the right balance of nutrients to maximize performance, preserve lean mass, and control hunger.</p>
        <p className="text-muted-foreground">This guide explains the formulas used, recommended macro splits for different objectives, examples, practical tips, and common mistakes — everything you need to help users get the most from your macro ratio calculator.</p>
        
        <h4 className='font-bold text-lg mt-4'>🔍 What are Macros (Macronutrients)?</h4>
        <p className="text-muted-foreground">Macronutrients are the three major nutrients that supply energy (calories):</p>
        <ul className="list-disc list-inside pl-4 text-muted-foreground">
          <li>Carbohydrates — 4 kcal per gram. Primary fuel for high-intensity activity and brain function.</li>
          <li>Protein — 4 kcal per gram. Essential for muscle repair, immune function, and satiety.</li>
          <li>Fat — 9 kcal per gram. Important for hormone production, fat-soluble vitamin absorption, and long-term energy.</li>
        </ul>
        <p className="text-muted-foreground">A macro ratio describes the percentage of total calories that comes from each macronutrient (e.g., 40% carbs / 30% protein / 30% fat).</p>
        
        <h4 className='font-bold text-lg mt-4'>⚙️ How the Macro Ratio Calculator Works (Formulas)</h4>
        <p className="text-muted-foreground">Start with daily calories — typically your TDEE (Total Daily Energy Expenditure) or an adjusted goal (calorie deficit for fat loss, surplus for gain).</p>
        <p className="text-muted-foreground">Choose a macro split — a percentage allocation for carbs/protein/fat (must total 100%).</p>
        <p className="text-muted-foreground">Convert percentages to grams using these formulas:</p>
        <p className='font-mono p-2 bg-muted rounded-md text-sm'>Calories from carbs = TotalCalories × (CarbPercent / 100)<br/>Grams of carbs = CaloriesFromCarbs / 4</p>
        <p className='font-mono p-2 bg-muted rounded-md text-sm'>Calories from protein = TotalCalories × (ProteinPercent / 100)<br/>Grams of protein = CaloriesFromProtein / 4</p>
        <p className='font-mono p-2 bg-muted rounded-md text-sm'>Calories from fat = TotalCalories × (FatPercent / 100)<br/>Grams of fat = CaloriesFromFat / 9</p>
        <p className="text-muted-foreground">Example: TDEE = 2,400 kcal, split = 40C / 30P / 30F</p>
        <p className="text-muted-foreground">Carbs: 2,400 × 0.40 = 960 kcal → 960 / 4 = 240 g</p>
        <p className="text-muted-foreground">Protein: 2,400 × 0.30 = 720 kcal → 720 / 4 = 180 g</p>
        <p className="text-muted-foreground">Fat: 2,400 × 0.30 = 720 kcal → 720 / 9 = 80 g</p>
        
        <h4 className='font-bold text-lg mt-4'>🎯 Recommended Macro Ratios by Goal</h4>
        <p className="text-muted-foreground">Different goals benefit from different macro priorities:</p>
        <h5 className='font-bold'>1. Fat Loss (Preserve muscle; manage hunger)</h5>
        <p className="text-muted-foreground">Typical splits:</p>
        <ul className="list-disc list-inside pl-4 text-muted-foreground">
          <li>Moderate protein approach: 30% P / 35% C / 35% F</li>
          <li>Higher protein (preferred): 35% P / 35% C / 30% F</li>
        </ul>
        <p className="text-muted-foreground">Protein: 1.6–2.2 g/kg bodyweight (or ~0.7–1.0 g/lb) to preserve lean mass.</p>
        <p className="text-muted-foreground">Calories: Aim for a 10–25% deficit from maintenance.</p>
        
        <h5 className='font-bold mt-2'>2. Muscle Gain (Lean bulk)</h5>
        <p className="text-muted-foreground">Typical splits: 25–30% P / 45–55% C / 20–30% F</p>
        <p className="text-muted-foreground">Protein: 1.6–2.2 g/kg bodyweight.</p>
        <p className="text-muted-foreground">Calories: 10–20% surplus above maintenance.</p>
        
        <h5 className='font-bold mt-2'>3. Maintenance / Recomposition</h5>
        <p className="text-muted-foreground">Typical splits: 30% P / 40% C / 30% F (balanced)</p>
        <p className="text-muted-foreground">Recomposition uses maintenance calories with slightly higher protein.</p>
        
        <h5 className='font-bold mt-2'>4. Low-Carb / Ketogenic</h5>
        <p className="text-muted-foreground">Typical splits: 5–10% C / 20–25% P / 65–75% F</p>
        <p className="text-muted-foreground">Not suitable for all; performance in high-intensity exercise may decrease.</p>
        
        <h5 className='font-bold mt-2'>5. Endurance Athletes</h5>
        <p className="text-muted-foreground">Typical splits: 55–65% C / 15–20% P / 20–25% F</p>
        <p className="text-muted-foreground">Higher carbs support glycogen replenishment and performance.</p>
        
        <h4 className='font-bold text-lg mt-4'>💪 Protein Targets: The Key Macro</h4>
        <p className="text-muted-foreground">While ratios matter, protein is the most important macro for body composition:</p>
        <ul className="list-disc list-inside pl-4 text-muted-foreground">
            <li>Sedentary: 0.8–1.0 g/kg</li>
            <li>Recreational exerciser: 1.2–1.6 g/kg</li>
            <li>Strength training / bodybuilding: 1.6–2.2 g/kg</li>
            <li>Older adults (preserving muscle): 1.2–1.8 g/kg</li>
        </ul>
        <p className="text-muted-foreground">When using a macro calculator, you can choose to lock protein as a gram target (based on bodyweight) and let carbs and fat fill the remaining calories.</p>
        
        <h4 className='font-bold text-lg mt-4'>🚶 Practical Steps to Use the Macro Ratio Calculator</h4>
        <ol className="list-decimal list-inside pl-4 text-muted-foreground">
            <li>Calculate TDEE (use a calorie needs calculator).</li>
            <li>Choose your goal (lose, maintain, gain). Adjust calories accordingly.</li>
            <li>Pick a macro split suitable for your goal. Consider activity type and personal preference.</li>
            <li>Enter those values into the macro ratio calculator — get grams for each macro.</li>
            <li>Plan meals so daily totals hit the macro targets. Use an app like MyFitnessPal or Cronometer.</li>
            <li>Reassess every 2–4 weeks: adjust calories or macros based on weight and performance changes.</li>
        </ol>

        <h4 className='font-bold text-lg mt-4'>📊 Example Workflows</h4>
        <p className="text-muted-foreground"><strong>Example A — Fat Loss</strong><br/>Weight: 80 kg | TDEE = 2,600 kcal | Goal = lose weight → 20% deficit → 2,080 kcal</p>
        <p className="text-muted-foreground">Choose high-protein split: 35% P / 35% C / 30% F</p>
        <p className="text-muted-foreground">Protein: 2080 × 0.35 / 4 = 182 g</p>
        <p className="text-muted-foreground">Carbs: 2080 × 0.35 / 4 = 182 g</p>
        <p className="text-muted-foreground">Fat: 2080 × 0.30 / 9 = 69 g</p>

        <p className="text-muted-foreground"><strong>Example B — Muscle Gain</strong><br/>Weight: 70 kg | TDEE = 2,400 kcal | Goal = +15% → 2,760 kcal</p>
        <p className="text-muted-foreground">Split: 30% C / 30% P / 40% F (or 50C/30P/20F if athlete)</p>
        <p className="text-muted-foreground">Protein: 2,760 × 0.30 / 4 = 207 g (this might be high—consider using 1.6–2.2 g/kg instead)</p>

        <h4 className='font-bold text-lg mt-4'>📝 Tracking Tips & Tools</h4>
        <ul className="list-disc list-inside pl-4 text-muted-foreground">
          <li>Use apps: MyFitnessPal, Cronometer, or LoseIt to log food and meet macro targets.</li>
          <li>Weigh & measure: Track progress with weekly weight & monthly measurements.</li>
          <li>Prep meals: Meal prep helps hit macros easier and avoids impulse eating.</li>
          <li>Adjust gradually: If progress stalls, tweak calories by 5–10% or adjust macros slightly.</li>
          <li>Mind food quality: Hitting macros with nutrient-poor foods can harm health; prioritize whole foods.</li>
        </ul>
        
        <h4 className='font-bold text-lg mt-4'>🚫 Common Mistakes to Avoid</h4>
        <ul className="list-disc list-inside pl-4 text-muted-foreground">
            <li>Obsessing over exact numbers: Aim for daily consistency and weekly averages.</li>
            <li>Ignoring protein: Too little protein undermines muscle preservation/gain.</li>
            <li>Setting unrealistic carbs/fats for lifestyle — pick a split you can sustain.</li>
            <li>Neglecting micronutrients: Focus on vitamins, minerals, and fiber too.</li>
            <li>Relying solely on apps without weighing portions — inaccurate inputs lead to wrong macro totals.</li>
        </ul>
        
        <h4 className='font-bold text-lg mt-4'>💡 Special Considerations</h4>
        <ul className="list-disc list-inside pl-4 text-muted-foreground">
            <li>Vegetarians / Vegans: Protein sources differ; consider slightly higher total protein to account for lower digestibility.</li>
            <li>Medical Conditions: Diabetes, kidney disease, or other conditions require professional guidance for macro targets.</li>
            <li>Pregnancy & Lactation: Energy and protein needs change — consult a clinician.</li>
            <li>Athletes: Timing (carb before/after workouts) matters; endurance athletes need more carbs.</li>
        </ul>

        <h4 className='font-bold text-lg mt-4'>❓ FAQ (Macro Ratio Calculator)</h4>
        <p className="text-muted-foreground"><strong>Q: Should I use percentages or grams for macros?</strong><br/>A: Percentages are good to set ratios; grams are what you actually track. Many advanced users set protein in grams (based on bodyweight) and allocate remaining calories to carbs and fat.</p>
        <p className="text-muted-foreground"><strong>Q: How often should I recalculate macros?</strong><br/>A: Recalculate when your weight changes significantly (≈3–5% body weight) or your activity level changes.</p>
        <p className="text-muted-foreground"><strong>Q: Can I switch macro splits weekly?</strong><br/>A: Yes — cycling carbs (carb cycling) can be effective — e.g., higher carbs on training days, lower on rest days.</p>
        <p className="text-muted-foreground"><strong>Q: What if my calculated protein is very high?</strong><br/>A: Check grams/kg. If protein exceeds ~2.5 g/kg, reconsider; it’s rarely necessary and may be hard to sustain.</p>
        <p className="text-muted-foreground"><strong>Q: Do fats affect hormones?</strong><br/>A: Yes. Very low-fat diets (&lt;15% of calories) can impair hormones and energy. Keep fats at least ~20% of calories for most people.</p>

        <h4 className='font-bold text-lg mt-4'>🏁 Conclusion</h4>
        <p className="text-muted-foreground">A Macro Ratio Calculator is your first step toward effective weight management and healthier living. By knowing your TDEE and adjusting your calorie intake, you can reach your fitness goals — whether it’s losing weight, gaining muscle, or maintaining a healthy lifestyle.</p>
        <p className="text-muted-foreground">Use the calculator daily, track your meals, and adjust your intake over time. Small, consistent efforts lead to sustainable results.</p>
      </div>
    </div>
  );
}

    