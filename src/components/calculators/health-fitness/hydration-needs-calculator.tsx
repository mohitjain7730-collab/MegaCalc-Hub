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
import { Droplets, Info, Target, BarChart3, HelpCircle } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  weight: z.number().positive(),
  unit: z.enum(['kg', 'lbs']),
  exerciseDuration: z.number().nonnegative().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function HydrationNeedsCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'lbs',
      weight: undefined,
      exerciseDuration: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    let weightInKg = values.weight;
    if (values.unit === 'lbs') {
      weightInKg *= 0.453592;
    }

    const baseIntake = weightInKg * 35;
    const exerciseWater = values.exerciseDuration ? (values.exerciseDuration / 30) * 350 : 0;
    const totalIntake = baseIntake + exerciseWater;
    
    setResult(totalIntake);
  };
  
  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Calculate Your Hydration Needs
          </CardTitle>
          <CardDescription>
            Determine your optimal daily water intake based on body weight and activity level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="weight" render={({ field }) => (
                    <FormItem><FormLabel>Weight ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="unit" render={({ field }) => (
                    <FormItem><FormLabel>Unit</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="kg">Kilograms (kg)</SelectItem><SelectItem value="lbs">Pounds (lbs)</SelectItem></SelectContent></Select></FormItem>
                )} />
                <FormField control={form.control} name="exerciseDuration" render={({ field }) => (
                    <FormItem className="md:col-span-2"><FormLabel>Daily Exercise Duration (minutes)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
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
                <Droplets className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Recommended Daily Water Intake</CardTitle>
                  <CardDescription>Personalized hydration target based on your inputs</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.toLocaleString(undefined, {maximumFractionDigits: 0})} ml</p>
                    <CardDescription>
                        Approximately {(result / 1000).toFixed(1)} liters or {(result / 236.6).toFixed(1)} glasses (8 oz).
                    </CardDescription>
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
              <h4 className="font-semibold text-foreground mb-2">Body Weight</h4>
              <p className="text-muted-foreground">
                Larger individuals need more water to support their larger body mass and higher metabolic rate. The base calculation uses 35 ml per kilogram of body weight, which accounts for normal daily functions including metabolism, digestion, and basic cellular processes.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Daily Exercise Duration</h4>
              <p className="text-muted-foreground">
                Physical activity increases fluid needs through sweating and increased respiration. The calculator adds approximately 350 ml (about 12 oz) of water for every 30 minutes of exercise. This accounts for average sweat rates during moderate-intensity activities. Very intense exercise, hot weather, or high humidity may require additional fluids.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Why Individual Needs Vary</h4>
              <p className="text-muted-foreground">
                Actual hydration needs can vary based on factors not included in this calculator: environmental temperature, humidity, altitude, diet (sodium/caffeine intake), pregnancy/breastfeeding, illness, and individual metabolism. Use the calculated amount as a starting point and adjust based on thirst, urine color, and energy levels.
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
              Explore other health and fitness calculators to optimize your wellness
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary hover:underline">
                    Daily Calorie Needs Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate your total daily energy expenditure to understand your overall nutritional needs.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/water-footprint-of-food-calculator" className="text-primary hover:underline">
                    Water Footprint of Food Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Understand the water required to produce different foods for a complete hydration perspective.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/bmr-calculator" className="text-primary hover:underline">
                    BMR Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate your basal metabolic rate to understand your body's basic energy and hydration needs.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/target-heart-rate-calculator" className="text-primary hover:underline">
                    Target Heart Rate Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Optimize your workouts, which affects your hydration needs during exercise.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5" />
              Complete Guide to Hydration Needs
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h2 className="text-xl font-bold text-foreground">How Much Water Do You Need Per Day?</h2>
            <p>A common starting point is <strong>~30–40 ml per kg</strong> bodyweight, plus extra during exercise and hot/humid days. Our calculator uses 35 ml/kg and adds ~350 ml per 30 minutes of activity.</p>

            <h3 className="font-semibold text-foreground mt-6">Factors That Increase Fluid Needs</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Exercise & heat:</strong> Higher sweat rates raise water and electrolyte requirements.</li>
              <li><strong>Altitude & dry air:</strong> Faster breathing and low humidity increase losses.</li>
              <li><strong>Diet:</strong> High‑fiber, high‑protein, or very salty/spicy meals can increase thirst.</li>
              <li><strong>Illness:</strong> Fever, vomiting, diarrhea, or certain medications elevate needs—seek medical guidance.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">Electrolytes 101</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Sodium:</strong> primary sweat electrolyte; replace during long sessions/hot weather.</li>
              <li><strong>Potassium & Magnesium:</strong> found in fruits/veg, dairy, beans, nuts; consider electrolyte mixes for prolonged exercise.</li>
              <li>Clear, pale‑yellow urine across the day is a simple hydration check.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">Practical Strategies</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Front‑load fluids earlier in the day; sip regularly rather than chug all at once.</li>
              <li>Use a bottle with volume markings; aim to finish set amounts by certain times.</li>
              <li>Include hydrating foods: fruit, vegetables, soups, yogurt.</li>
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
              Common questions about hydration needs and water intake
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Is the "8 glasses a day" rule accurate?</h4>
              <p className="text-muted-foreground">
                The 8 glasses (64 oz) rule is a rough estimate that works for some people but not all. Individual needs vary based on body size, activity level, climate, and other factors. A 120-pound sedentary person may need less, while a 200-pound athlete in hot weather may need significantly more. Use personalized calculations like this calculator provides for better accuracy.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Do other beverages count toward my water intake?</h4>
              <p className="text-muted-foreground">
                Yes, but with caveats. Coffee, tea, milk, and even foods with high water content (fruits, vegetables, soups) contribute to hydration. However, caffeinated beverages have mild diuretic effects, and alcoholic beverages are dehydrating. While they do provide fluid, plain water is still the best choice for optimal hydration. Aim to get at least half your daily fluid from plain water.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I know if I'm drinking enough water?</h4>
              <p className="text-muted-foreground">
                Signs of adequate hydration include: clear to pale yellow urine, rarely feeling thirsty, good energy levels, and regular urination (every 2-4 hours). Signs you may need more water include: dark yellow urine, frequent thirst, fatigue, headaches, dry skin, or infrequent urination. Thirst is actually a late indicator of dehydration, so aim to drink regularly throughout the day rather than waiting until you're thirsty.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can you drink too much water?</h4>
              <p className="text-muted-foreground">
                Yes, in rare cases. Drinking excessive amounts of water in a short time (several liters within an hour) can lead to water intoxication (hyponatremia), where sodium levels become dangerously low. However, this is very uncommon in healthy people with normal kidney function. For most people, drinking too much water just means more frequent bathroom trips. The bigger concern for most is not drinking enough.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How does exercise affect hydration needs?</h4>
              <p className="text-muted-foreground">
                Exercise significantly increases fluid needs through sweating and increased respiration. During moderate exercise, you may lose 0.5-1 liter of water per hour through sweat. Intense exercise, especially in hot or humid conditions, can cause losses of 1-2 liters per hour. This is why the calculator adds extra water for exercise duration. Remember to hydrate before, during (for longer sessions), and after exercise.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I drink water even when I'm not thirsty?</h4>
              <p className="text-muted-foreground">
                Yes, especially during exercise, in hot weather, or if you're prone to dehydration. Thirst is a late indicator, meaning by the time you feel thirsty, you're already somewhat dehydrated. Proactive hydration is better—sipping water throughout the day rather than waiting for thirst. However, don't force excessive amounts if you're not thirsty and your urine is already clear, as this can be unnecessary.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Do I need to drink more water in hot weather?</h4>
              <p className="text-muted-foreground">
                Absolutely. Hot weather increases sweat production, which increases fluid needs. In very hot or humid conditions, you may need 50-100% more water than usual. The same applies to high altitudes, where faster breathing and lower humidity increase fluid losses. Adjust your intake based on conditions—if you're sweating more, drink more.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What about hydration during pregnancy and breastfeeding?</h4>
              <p className="text-muted-foreground">
                Pregnant and breastfeeding women have increased fluid needs. Pregnant women typically need an additional 300-500 ml per day, and breastfeeding women need even more (about 700 ml extra) to support milk production. This calculator doesn't account for these special circumstances, so pregnant and breastfeeding women should add to the calculated amount or consult with their healthcare provider for personalized guidance.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Does age affect hydration needs?</h4>
              <p className="text-muted-foreground">
                Older adults often have reduced thirst sensation and may be at higher risk for dehydration, yet their basic fluid needs remain similar to younger adults. The same calculation applies, but older adults should be more proactive about hydration since they may not feel thirsty even when dehydrated. Medications and certain health conditions common in older adults may also affect fluid needs.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I stay hydrated if I don't like plain water?</h4>
              <p className="text-muted-foreground">
                Try adding natural flavorings like lemon, cucumber, mint, or berries. Herbal teas (hot or iced), sparkling water, and diluted fruit juices are also good options. Foods with high water content like watermelon, cucumbers, oranges, and soups contribute significantly to hydration. The key is finding palatable fluids you'll actually drink consistently throughout the day.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
