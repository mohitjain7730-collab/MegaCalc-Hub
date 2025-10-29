'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Info, Target, BarChart3, PlusCircle, XCircle, HelpCircle } from 'lucide-react';
import Link from 'next/link';

const foodItemSchema = z.object({
  name: z.string().optional(),
  gi: z.number().min(0).max(100),
  carbs: z.number().positive(),
});

const formSchema = z.object({
  items: z.array(foodItemSchema).min(1, "Add at least one food item."),
});

type FormValues = z.infer<typeof formSchema>;

const getGlCategory = (gl: number) => {
    if (gl <= 10) return { name: 'Low', color: 'text-green-500' };
    if (gl <= 19) return { name: 'Medium', color: 'text-yellow-500' };
    return { name: 'High', color: 'text-red-500' };
};

export default function MealGlycemicLoadCalculator() {
  const [result, setResult] = useState<{ gl: number; category: { name: string, color: string } } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      items: [{ name: '', gi: undefined, carbs: undefined }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  const onSubmit = (values: FormValues) => {
    const totalGl = values.items.reduce((sum, item) => {
        const itemGl = ((item.gi || 0) * (item.carbs || 0)) / 100;
        return sum + itemGl;
    }, 0);
    setResult({ gl: totalGl, category: getGlCategory(totalGl) });
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Calculate Meal Glycemic Load
          </CardTitle>
          <CardDescription>
            Add each food item in your meal with its Glycemic Index (GI) and net carbs to calculate the total GL
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <div className="grid grid-cols-[1fr,100px,100px,auto] gap-2 items-center font-medium text-sm mb-2">
                  <FormLabel>Food Item</FormLabel>
                  <FormLabel className="text-center">GI (0-100)</FormLabel>
                  <FormLabel className="text-center">Net Carbs (g)</FormLabel>
                  <span></span>
                </div>
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-[1fr,100px,100px,auto] gap-2 items-start mb-2">
                    <FormField control={form.control} name={`items.${index}.name`} render={({ field }) => ( <FormItem><FormControl><Input placeholder="e.g., Apple" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name={`items.${index}.gi`} render={({ field }) => ( <FormItem><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name={`items.${index}.carbs`} render={({ field }) => ( <FormItem><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )} />
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length === 1}><XCircle className="h-5 w-5 text-destructive" /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ name: '', gi: undefined, carbs: undefined })}><PlusCircle className="mr-2 h-4 w-4" /> Add Item</Button>
              </div>
              <Button type="submit">Calculate Total GL</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {result !== null && (
        <Card>
            <CardHeader>
              <div className='flex items-center gap-4'>
                <Leaf className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Total Meal Glycemic Load</CardTitle>
                  <CardDescription>Combined blood sugar impact of all meal components</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-center">
                 <p className="text-4xl font-bold">{result.gl.toFixed(1)}</p>
                 <p className={`mt-2 text-xl font-semibold ${result.category.color}`}>{result.category.name} Glycemic Load</p>
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
              <h4 className="font-semibold text-foreground mb-2">Food Item (Optional)</h4>
              <p className="text-muted-foreground">
                A descriptive name for the food helps you track and remember what you're calculating. This is optional but useful for meal planning and reviewing your calculations later.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Glycemic Index (GI)</h4>
              <p className="text-muted-foreground">
                The GI rating (0-100) for each individual food item. This indicates how quickly that specific food raises blood sugar. You can find GI values in online databases, nutrition apps, or reference materials. Remember that cooking method and ripeness can affect GI.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Net Carbs in Serving (g)</h4>
              <p className="text-muted-foreground">
                The grams of digestible carbohydrates (total carbs minus fiber) for each food item in your meal. This should reflect the actual portion size you're eating. Be as accurate as possible for best results—weighing or measuring portions helps.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Adding Multiple Items</h4>
              <p className="text-muted-foreground">
                The calculator sums the glycemic load of all food items in your meal. This gives you the total meal GL, which better reflects real-world eating since we rarely eat single foods in isolation. Include all carbohydrate-containing foods in your meal for accurate results.
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
              Explore other nutrition calculators to manage blood sugar and optimize your diet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/glycemic-load-calculator" className="text-primary hover:underline">
                    Single‑Food Glycemic Load Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate the glycemic load of individual foods to understand their impact.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/carbohydrate-intake-calculator" className="text-primary hover:underline">
                    Carbohydrate Intake Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Determine your optimal daily carbohydrate intake based on activity level.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/macro-ratio-calculator" className="text-primary hover:underline">
                    Macro Ratio Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Balance your macronutrients to support stable blood sugar throughout the day.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/intermittent-fasting-calculator" className="text-primary hover:underline">
                    Intermittent Fasting Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Plan your eating windows to optimize meal timing and blood sugar management.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5" />
              Complete Guide to Meal Glycemic Load
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h2 className="text-xl font-bold text-foreground">How to Use Glycemic Load for Real Meals</h2>
            <p>GL estimates a meal's blood‑sugar impact by combining the <strong>Glycemic Index (GI)</strong> with the <strong>carbs in your serving</strong>. This tool sums GL across foods, giving you a clearer picture than single ingredients alone.</p>

            <h3 className="font-semibold text-foreground mt-6">Meal GL Basics</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Formula:</strong> GL = GI × grams of available carbs ÷ 100 (per food); meal GL is the sum.</li>
              <li><strong>Targets (per serving):</strong> 0–10 low, 11–19 medium, ≥20 high. For full meals, aim for a <strong>moderate total GL</strong> unless fueling hard training.</li>
              <li><strong>Portions matter:</strong> Even low‑GI foods can create a high GL if servings are very large.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">Lower‑GL Meal Building</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Anchor the plate with <strong>protein</strong> (eggs, fish, chicken, tofu, Greek yogurt).</li>
              <li>Use <strong>high‑fiber carbs</strong> (beans/lentils, oats, brown rice, whole‑grain breads, fruit) most of the time.</li>
              <li>Add <strong>non‑starchy vegetables</strong> and <strong>healthy fats</strong> (olive oil, avocado, nuts) to slow digestion.</li>
              <li>Save <strong>fast carbs</strong> (white rice, bread, sports drinks) for around intense workouts if needed.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">Example Plates</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Burrito bowl:</strong> beans + rice (moderate portion) + chicken + salsa + avocado + lettuce → balanced, moderate GL.</li>
              <li><strong>Breakfast:</strong> oats + milk/yogurt + berries + nuts → fiber‑rich, lower GL.</li>
              <li><strong>Pasta night:</strong> whole‑grain pasta + turkey meat sauce + salad + olive‑oil dressing → moderate GL with protein and fiber.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">Special Situations</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Before hard training:</strong> slightly higher GL may help performance; prioritize easy‑to‑digest carbs.</li>
              <li><strong>Desk days / weight loss phases:</strong> choose lower‑GL plates with more vegetables and legumes.</li>
              <li><strong>Diabetes management:</strong> pair carbs with protein/fat, keep consistent portions, and follow clinician guidance.</li>
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
              Common questions about meal glycemic load and blood sugar management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Is GL better than GI?</h4>
              <p className="text-muted-foreground">
                GL better reflects real meals because it accounts for <em>how much</em> you eat. While GI tells you the speed of blood sugar rise for a standardized portion, GL considers your actual serving size. For example, watermelon has a high GI but low GL because you'd typically eat a small portion relative to its carb content. GL is more practical for daily meal planning.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Do protein and fat reduce GL?</h4>
              <p className="text-muted-foreground">
                They don't change the GI of a carbohydrate, but they lower the <em>meal's effective impact</em> by slowing absorption. When you add protein, fat, or fiber to a meal, the overall digestion slows down, leading to a more gradual blood sugar rise. This is why the same amount of carbs from white bread alone vs. a turkey and avocado sandwich have very different real-world impacts, even if the bread's GI stays the same.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I count GL forever?</h4>
              <p className="text-muted-foreground">
                Use it as an <em>education tool</em>—once you learn which combinations keep you energized, you can eyeball portions. After using the calculator for a few weeks, you'll start to recognize which foods and meal combinations work well for you. You can then make informed choices without calculating every meal. Revisit the calculator when trying new foods or if your energy levels change.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How accurate is meal GL calculation?</h4>
              <p className="text-muted-foreground">
                The calculation is mathematically accurate based on the GI values and carb amounts you enter. However, the actual blood sugar response can vary based on individual metabolism, cooking methods, food combinations, and other factors. Use GL as a guide rather than an absolute predictor. If you have diabetes, always combine GL knowledge with blood glucose monitoring.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What if a food's GI isn't available?</h4>
              <p className="text-muted-foreground">
                You can estimate based on similar foods. Generally, whole, unprocessed foods have lower GI than refined versions. For example, if a specific brand of bread doesn't have a published GI, you could use a similar whole-grain bread's GI as an estimate. When in doubt, err on the side of a higher GI estimate, or simply use the carbohydrate amount and focus on portion control.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Does the order of foods in the meal matter?</h4>
              <p className="text-muted-foreground">
                Some research suggests eating protein and vegetables before carbohydrates can help moderate blood sugar response, but the calculator doesn't account for eating order. The calculated GL reflects the total impact regardless of order. However, if you're very sensitive to blood sugar spikes, you might experiment with food order as an additional strategy.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How does cooking affect the GI values I should use?</h4>
              <p className="text-muted-foreground">
                Cooking generally increases GI by breaking down starch, making it easier to digest. Al dente pasta has a lower GI than well-cooked pasta. Raw carrots have a lower GI than cooked carrots. However, GI databases often list specific cooking methods. If you're cooking something differently than the standard method, the GI might vary slightly, but using published values will still give you a good estimate.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I avoid high-GL meals entirely?</h4>
              <p className="text-muted-foreground">
                Not necessarily. High-GL meals can be appropriate around intense exercise when your body needs quick energy. The key is balance—if you have a high-GL meal before or after a hard workout, that's different from having one while sitting at a desk all day. Focus on lower-GL meals most of the time, with strategic higher-GL meals when appropriate for your activity level.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I reduce a meal's GL by adding more non-carb foods?</h4>
              <p className="text-muted-foreground">
                The calculator only includes carbohydrate-containing foods in the GL calculation (protein and fat don't have GI values). However, adding protein, fat, and fiber-rich vegetables to a meal will slow down the overall digestion and reduce the effective blood sugar impact, even if the calculated GL stays the same. This is why meal composition matters just as much as the GL number.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's a good target GL for a single meal?</h4>
              <p className="text-muted-foreground">
                For most people aiming for steady energy, keeping individual meals under 20 GL is reasonable. Lower GL (under 10) is ideal for snacks or low-activity periods. Medium GL (11-19) works well for most main meals. High GL (20+) can be appropriate before or after intense exercise. Remember that your total daily GL matters more than any single meal, so you can balance higher and lower GL meals throughout the day.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
