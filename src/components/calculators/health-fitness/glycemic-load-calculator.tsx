'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Info, Target, BarChart3, HelpCircle } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  gi: z.number().min(0).max(100),
  carbs: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

const getGlCategory = (gl: number) => {
    if (gl <= 10) return { name: 'Low', color: 'text-green-500' };
    if (gl <= 19) return { name: 'Medium', color: 'text-yellow-500' };
    return { name: 'High', color: 'text-red-500' };
};

export default function GlycemicLoadCalculator() {
  const [result, setResult] = useState<{ gl: number; category: { name: string, color: string } } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gi: undefined,
      carbs: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const gl = (values.gi * values.carbs) / 100;
    setResult({ gl, category: getGlCategory(gl) });
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Calculate Glycemic Load
          </CardTitle>
          <CardDescription>
            Calculate how much a food serving will raise blood glucose levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="gi" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Glycemic Index (GI) of Food</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0-100" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="carbs" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Net Carbs in Serving (g)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit">Calculate Glycemic Load</Button>
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
                  <CardTitle>Glycemic Load (GL) Result</CardTitle>
                  <CardDescription>Blood sugar impact assessment</CardDescription>
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
              <h4 className="font-semibold text-foreground mb-2">Glycemic Index (GI)</h4>
              <p className="text-muted-foreground">
                A rating from 0 to 100 that indicates how quickly a carbohydrate-containing food raises blood sugar levels compared to pure glucose (which has a GI of 100). Low GI foods (55 or less) cause a slower, smaller rise in blood sugar, while high GI foods (70+) cause rapid spikes. You can find GI values for common foods through online databases or nutrition references.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Net Carbs in Serving (g)</h4>
              <p className="text-muted-foreground">
                The total grams of carbohydrates in the portion of food you are eating, minus the fiber content. This is also called "available carbohydrates" or "digestible carbs." Fiber doesn't significantly impact blood sugar, so subtracting it gives you a more accurate picture of how the food will affect your glucose levels.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Why Both Matter</h4>
              <p className="text-muted-foreground">
                GI tells you the speed of blood sugar rise, but GL tells you the actual impact by considering how much you're eating. A food can have a high GI but low GL if the serving is small (like watermelon), making GL a more practical measure for real-world eating.
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
              Explore other nutrition calculators to optimize your blood sugar management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/carbohydrate-intake-calculator" className="text-primary hover:underline">
                    Carbohydrate Intake Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate your optimal daily carbohydrate intake based on activity level.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/intermittent-fasting-calculator" className="text-primary hover:underline">
                    Intermittent Fasting Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Plan your eating windows to better manage blood sugar throughout the day.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/meal-glycemic-load-calculator" className="text-primary hover:underline">
                    Meal Glycemic Load Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate the total glycemic load of an entire meal with multiple foods.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/macro-ratio-calculator" className="text-primary hover:underline">
                    Macro Ratio Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Balance your macronutrients to support stable blood sugar levels.
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
              Complete Guide to Glycemic Load
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h2 className="text-xl font-bold text-foreground">GI vs GL: What's the Difference?</h2>
            <p>GI measures speed; GL measures speed × amount. GL therefore predicts a meal's real‑world impact more accurately.</p>

            <h3 className="font-semibold text-foreground mt-6">Practical Ways to Lower GL</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Choose minimally processed carbs (oats, brown rice, legumes, fruit).</li>
              <li>Pair carbs with <strong>protein, fiber, and healthy fat</strong> to slow absorption.</li>
              <li>Mind portion size—bigger servings raise GL even if GI is moderate.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">Who Benefits from Tracking GL?</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>People focused on steady energy and appetite control.</li>
              <li>Athletes balancing high‑ and low‑GI choices around training.</li>
              <li>Those managing blood glucose under professional guidance.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">What Is Glycemic Load, Precisely?</h3>
            <p>
              <strong>GL = (GI × grams of available carbohydrate in the serving) ÷ 100.</strong> A food can have a high GI but a low GL if
              the serving contains few carbs (e.g., watermelon). That's why GL often aligns better with how meals feel in daily life.
            </p>

            <h3 className="font-semibold text-foreground mt-6">Sample GL of Common Foods (approximate)</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Apple (medium): low GL</li>
              <li>White rice (1 cup cooked): medium–high GL depending on portion</li>
              <li>Beans/lentils (1 cup cooked): low–medium GL with high fiber and protein</li>
              <li>Whole‑grain bread (2 slices): medium GL—pair with lean protein for steadier response</li>
            </ul>

            <p className="italic mt-6">Educational use only. Work with your clinician for individualized nutrition targets.</p>
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
              Common questions about glycemic load and blood sugar management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Is GL all I need to track?</h4>
              <p className="text-muted-foreground">
                No—overall nutrients and calories still matter. GL is one tool among many to shape meals. While it's useful for understanding blood sugar impact, you should also consider total calories, macronutrients, vitamins, minerals, and fiber when making food choices. Use GL as a guide, not the only factor.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can athletes use high‑GI foods?</h4>
              <p className="text-muted-foreground">
                Around intense sessions, higher‑GI foods can be helpful for rapid fueling. During and after high-intensity training, the body needs quick energy to replenish glycogen stores. High-GI foods consumed around workouts are less likely to cause problematic blood sugar spikes because the glucose is immediately used by working muscles. However, for most daily meals, lower-GL foods provide better sustained energy.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Do protein and fat change GI?</h4>
              <p className="text-muted-foreground">
                They don't change GI of the carb itself, but they slow gastric emptying and lower the meal's effective GL impact. When you pair carbohydrates with protein, fat, or fiber, the overall meal digests more slowly, leading to a more gradual blood sugar rise. This is why a slice of bread alone may spike blood sugar, but bread with turkey and avocado has a much lower effective GL.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's considered a low, medium, or high GL?</h4>
              <p className="text-muted-foreground">
                Low GL is 10 or less, medium is 11-19, and high is 20 or more. These ranges help you understand the blood sugar impact of foods. However, remember that you can enjoy high-GL foods in moderation, especially if you pair them with protein and fat to slow absorption. The goal is overall balance across the day.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How does GL differ from total carbs?</h4>
              <p className="text-muted-foreground">
                GL considers both the amount of carbs AND how quickly they raise blood sugar. Two foods could have the same amount of carbs but very different GL values. For example, 50g of carbs from white rice (high GI) would have a much higher GL than 50g of carbs from lentils (low GI), even though the total carbs are the same.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I use GL to manage diabetes?</h4>
              <p className="text-muted-foreground">
                GL can be a useful tool for people with diabetes, but it should be used alongside medical guidance, blood glucose monitoring, and medication management. Work with your healthcare provider or registered dietitian to determine appropriate GL targets for your individual needs. Different people respond differently to the same foods, so personal experimentation and monitoring are key.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I find the GI of foods?</h4>
              <p className="text-muted-foreground">
                You can find GI values in online databases like the University of Sydney's Glycemic Index database, nutrition apps, or reference books. Many common foods have been tested. If a food's GI isn't available, you can estimate based on similar foods—whole, unprocessed foods generally have lower GI than refined versions of the same food.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Does cooking method affect GL?</h4>
              <p className="text-muted-foreground">
                Yes. Cooking methods that break down starch (like boiling pasta longer or cooking rice until very soft) can increase GI. However, pairing cooked carbs with other foods (protein, fat, fiber) still moderates the overall GL. Al dente pasta, slightly undercooked rice, and raw vegetables generally have lower GI than their fully cooked counterparts.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Is low GL always better?</h4>
              <p className="text-muted-foreground">
                Not always. Context matters. For steady energy throughout the day, lower GL is generally better. However, athletes may benefit from higher GL foods around training for rapid energy. Also, very low GL meals may not provide enough quick energy if you're feeling sluggish and need a boost. Balance is key—aim for lower GL most of the time, with strategic higher GL when appropriate.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I combine foods to lower overall meal GL?</h4>
              <p className="text-muted-foreground">
                Absolutely! That's one of the best strategies for managing blood sugar. Pairing a moderate-GL food (like white rice) with protein (chicken), fat (avocado), and fiber (vegetables) creates a meal with a much lower effective GL than eating the rice alone. This is the foundation of balanced meal planning—food combinations matter more than individual foods in isolation.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
