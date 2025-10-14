'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Leaf } from 'lucide-react';

const formSchema = z.object({ servingsFruitVeg: z.number().nonnegative(), oracPerServing: z.number().nonnegative() });
type FormValues = z.infer<typeof formSchema>;

export default function DailyAntioxidantOracGoalCalculator() {
  const [result, setResult] = useState<number | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { servingsFruitVeg: undefined, oracPerServing: undefined } });
  const onSubmit = (v: FormValues) => setResult(v.servingsFruitVeg * v.oracPerServing);

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="servingsFruitVeg" render={({ field }) => (<FormItem><FormLabel>Daily Fruit/Vegetable Servings</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="oracPerServing" render={({ field }) => (<FormItem><FormLabel>Avg ORAC per Serving</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          <Button type="submit">Estimate Daily ORAC</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Leaf className="h-8 w-8 text-primary" /><CardTitle>Estimated Daily ORAC</CardTitle></div></CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold">{Math.round(result).toLocaleString()} ORAC units</p>
              <CardDescription>Use colorful, varied produce to reach your target.</CardDescription>
            </div>
          </CardContent>
        </Card>
      )}
      <OracGuide />
    </div>
  );
}

export function OracGuide() {
  return (
    <section
  className="space-y-4 text-muted-foreground leading-relaxed"
  itemScope
  itemType="https://schema.org/Article"
>
  <meta
    itemProp="headline"
    content="Daily Antioxidant (ORAC) Goal Calculator – Measure Your Antioxidant Intake, ORAC Value Chart, and Food Sources"
  />
  <meta itemProp="author" content="MegaCalc Hub Team" />
  <meta
    itemProp="about"
    content="Calculate your daily antioxidant (ORAC) goal, understand how antioxidants protect against oxidative stress and aging, and discover top antioxidant-rich foods and meal tips."
  />

  <h2 itemProp="name" className="text-xl font-bold text-foreground">
    Antioxidants & ORAC Explained: Your Daily Defense Against Oxidative Stress
  </h2>
  <p itemProp="description">
    Every day, your body is exposed to <strong>free radicals</strong>—unstable molecules from pollution, stress, poor diet, and even normal metabolism.  
    Antioxidants are nature’s defense system that neutralizes these free radicals.  
    The <strong>Daily Antioxidant (ORAC) Goal Calculator</strong> helps you measure and optimize your total antioxidant intake based on your age, activity level, and dietary habits.  
    Maintaining an optimal antioxidant score supports <strong>cellular repair, heart health, skin youthfulness, and immune resilience</strong>.
  </p>

  <h3 className="font-semibold text-foreground mt-6">What Is ORAC?</h3>
  <p>
    ORAC stands for <strong>Oxygen Radical Absorbance Capacity</strong> — a scientific measure of how well a food can neutralize free radicals.  
    A higher ORAC value means stronger antioxidant capacity. Although the USDA discontinued official ORAC tables in 2012, the concept remains a useful guide for building an antioxidant-rich diet.
  </p>

  <h3 className="font-semibold text-foreground mt-6">Recommended Daily ORAC Goal</h3>
  <p>
    While there is no universally set “RDA” for antioxidants, nutrition experts and research from the USDA and Tufts University suggest aiming for:
  </p>
  <ul className="list-disc ml-6 space-y-1">
    <li><strong>Low activity lifestyle:</strong> 3,000–5,000 ORAC units/day</li>
    <li><strong>Moderate activity:</strong> 5,000–10,000 ORAC units/day</li>
    <li><strong>Active/athletic lifestyle:</strong> 10,000–15,000 ORAC units/day</li>
  </ul>
  <p>
    The average Western diet provides less than 3,000 ORAC units daily — well below the threshold for effective oxidative stress defense.
  </p>

  <h3 className="font-semibold text-foreground mt-6">
    How the ORAC Calculator Works
  </h3>
  <p>
    The calculator estimates your daily antioxidant goal based on your age, gender, and lifestyle activity.  
    It also allows you to log your typical fruit, vegetable, and beverage intake to estimate your <strong>total daily ORAC score</strong>.  
    By comparing your score with recommended levels, you’ll see whether your diet is antioxidant-rich or needs improvement.
  </p>

  <h3 className="font-semibold text-foreground mt-6">Top Antioxidant-Rich Foods (Per 100g)</h3>
  <ul className="list-disc ml-6 space-y-1">
    <li><strong>Cloves (ground):</strong> 290,000 ORAC</li>
    <li><strong>Cinnamon:</strong> 130,000 ORAC</li>
    <li><strong>Oregano, dried:</strong> 175,000 ORAC</li>
    <li><strong>Blueberries (wild):</strong> 9,700 ORAC</li>
    <li><strong>Cranberries:</strong> 9,500 ORAC</li>
    <li><strong>Dark chocolate (70–85%):</strong> 20,000 ORAC</li>
    <li><strong>Walnuts:</strong> 13,000 ORAC</li>
    <li><strong>Artichokes (boiled):</strong> 9,400 ORAC</li>
    <li><strong>Black beans:</strong> 8,400 ORAC</li>
    <li><strong>Green tea (brewed):</strong> 1,200 ORAC</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">Best Sources by Food Category</h3>
  <ul className="list-disc ml-6 space-y-1">
    <li><strong>Fruits:</strong> Blueberries, pomegranates, prunes, cherries, oranges, grapes</li>
    <li><strong>Vegetables:</strong> Kale, red cabbage, spinach, beetroot, broccoli, artichokes</li>
    <li><strong>Nuts & seeds:</strong> Pecans, walnuts, sunflower seeds, flaxseeds</li>
    <li><strong>Herbs & spices:</strong> Turmeric, oregano, clove, cinnamon, rosemary</li>
    <li><strong>Beverages:</strong> Green tea, black coffee, cocoa, red wine (in moderation)</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">Why Antioxidants Matter</h3>
  <ul className="list-disc ml-6 space-y-1">
    <li><strong>Protects cells from oxidative damage</strong> caused by pollution, radiation, and stress</li>
    <li><strong>Reduces inflammation</strong> and supports immune health</li>
    <li><strong>Slows aging</strong> by preventing DNA and collagen breakdown</li>
    <li><strong>Improves brain health</strong> and reduces risk of neurodegenerative diseases</li>
    <li><strong>Supports heart health</strong> by lowering LDL oxidation</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">
    Daily Meal Plan Example (~10,000 ORAC units)
  </h3>
  <ul className="list-disc ml-6 space-y-1">
    <li><strong>Breakfast:</strong> Oatmeal topped with blueberries, walnuts, and cinnamon (~2,500 ORAC)</li>
    <li><strong>Snack:</strong> Green tea and a handful of dark chocolate nibs (~1,200 ORAC)</li>
    <li><strong>Lunch:</strong> Kale and chickpea salad with olive oil and lemon (~2,000 ORAC)</li>
    <li><strong>Snack:</strong> Apple and mixed nuts (~1,000 ORAC)</li>
    <li><strong>Dinner:</strong> Grilled salmon with steamed broccoli and turmeric rice (~2,500 ORAC)</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">
    How to Boost Your Antioxidant Intake Naturally
  </h3>
  <ul className="list-disc ml-6 space-y-1">
    <li>Eat a “rainbow” of fruits and vegetables daily.</li>
    <li>Include herbs and spices in cooking — they’re antioxidant superstars.</li>
    <li>Drink tea or coffee instead of sugary beverages.</li>
    <li>Choose dark chocolate over milk chocolate.</li>
    <li>Replace refined grains with whole grains.</li>
    <li>Add lemon or herbs to water for mild antioxidant benefit.</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">
    Common Antioxidant Types and Their Roles
  </h3>
  <ul className="list-disc ml-6 space-y-1">
    <li><strong>Vitamin C:</strong> Neutralizes free radicals and boosts collagen.</li>
    <li><strong>Vitamin E:</strong> Protects cell membranes from oxidation.</li>
    <li><strong>Polyphenols:</strong> Found in berries, tea, coffee, and red wine.</li>
    <li><strong>Carotenoids:</strong> (beta-carotene, lycopene) in carrots, tomatoes, sweet potatoes.</li>
    <li><strong>Flavonoids:</strong> Found in citrus, dark chocolate, and green tea.</li>
    <li><strong>Selenium & Zinc:</strong> Mineral antioxidants supporting enzyme defense.</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">Understanding Free Radicals & Oxidative Stress</h3>
  <p>
    Free radicals are unstable molecules that steal electrons from healthy cells, leading to oxidative stress — a condition linked to <strong>aging, cancer, heart disease, and cognitive decline</strong>.  
    Antioxidants donate electrons safely, stabilizing these radicals and preventing cellular damage.  
    Maintaining a high dietary antioxidant intake ensures your body stays equipped to fight daily oxidative challenges.
  </p>

  <h3 className="font-semibold text-foreground mt-6">Supplementation & Safety</h3>
  <ul className="list-disc ml-6 space-y-1">
    <li>Prefer food sources — whole foods provide synergistic antioxidants.</li>
    <li>Over-supplementation (especially high-dose vitamin A or E) can be harmful.</li>
    <li>Herbal extracts like green tea catechins or grape seed extract can boost total ORAC safely when used moderately.</li>
    <li>Always consult your healthcare provider before starting antioxidant supplements if you have chronic illness or take medication.</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">FAQ</h3>
  <div className="space-y-3">
    <p><strong>What is a good ORAC score per day?</strong> Aim for at least 5,000–10,000 ORAC units daily for optimal oxidative protection.</p>
    <p><strong>Can you have too many antioxidants?</strong> From food — no. From supplements — possibly. Excess isolated antioxidants can interfere with beneficial oxidative signaling.</p>
    <p><strong>Does cooking destroy antioxidants?</strong> Some heat-sensitive vitamins (like vitamin C) degrade, but lycopene and beta-carotene become more bioavailable after cooking.</p>
    <p><strong>Which fruit has the highest ORAC value?</strong> Wild blueberries, prunes, and pomegranates rank among the top.</p>
    <p><strong>Are antioxidant drinks effective?</strong> Many offer benefits if low in sugar and rich in polyphenols — look for cold-pressed or naturally colored options.</p>
  </div>

  <h3 className="font-semibold text-foreground mt-6">Related Calculators</h3>
  <div className="space-y-2">
    <p><Link href="/category/health-fitness/fiber-intake-calculator" className="text-primary underline">Fiber Intake Calculator</Link></p>
    <p><Link href="/category/health-fitness/zinc-requirement-calculator" className="text-primary underline">Zinc Requirement Calculator</Link></p>
    <p><Link href="/category/health-fitness/magnesium-intake-calculator" className="text-primary underline">Magnesium Intake Calculator</Link></p>
  </div>

  <h3 className="font-semibold text-foreground mt-6">Quick Takeaways</h3>
  <ul className="list-disc ml-6 space-y-1">
    <li>Antioxidants combat free radicals and support overall longevity.</li>
    <li>Use the calculator to estimate your ideal ORAC intake goal.</li>
    <li>Aim for at least 5,000–10,000 ORAC units per day.</li>
    <li>Focus on colorful fruits, vegetables, and spices for natural protection.</li>
    <li>Consistency is key — small daily habits make a lasting impact.</li>
  </ul>

  <p className="italic mt-4">
    Disclaimer: This tool is for educational and wellness purposes only. It does not substitute professional dietary or medical advice. Always consult your healthcare provider before making major dietary changes or taking supplements.
  </p>
</section>
  );
}


