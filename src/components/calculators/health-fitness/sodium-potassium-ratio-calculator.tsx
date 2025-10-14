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
import { Utensils } from 'lucide-react';

const formSchema = z.object({ sodium: z.number().nonnegative(), potassium: z.number().nonnegative() });
type FormValues = z.infer<typeof formSchema>;

export default function SodiumPotassiumRatioCalculator() {
  const [ratio, setRatio] = useState<number | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { sodium: undefined, potassium: undefined } });
  const onSubmit = (v: FormValues) => setRatio(v.sodium > 0 && v.potassium > 0 ? v.sodium / v.potassium : 0);

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="sodium" render={({ field }) => (<FormItem><FormLabel>Sodium Intake (mg/day)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="potassium" render={({ field }) => (<FormItem><FormLabel>Potassium Intake (mg/day)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          <Button type="submit">Calculate Na:K Ratio</Button>
        </form>
      </Form>
      {ratio !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Utensils className="h-8 w-8 text-primary" /><CardTitle>Sodium:Potassium Ratio</CardTitle></div></CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold">{ratio.toFixed(2)}</p>
              <CardDescription>Lower ratios (closer to or below 1.0) are generally considered favorable.</CardDescription>
            </div>
          </CardContent>
        </Card>
      )}
      <NaKGuide />
    </div>
  );
}

export function NaKGuide() {
  return (
    <section
  className="space-y-4 text-muted-foreground leading-relaxed"
  itemScope
  itemType="https://schema.org/Article"
>
  <meta
    itemProp="headline"
    content="Sodium to Potassium Ratio Calculator – Ideal Na:K Ratio, Daily Requirements, and Electrolyte Balance Guide"
  />
  <meta itemProp="author" content="MegaCalc Hub Team" />
  <meta
    itemProp="about"
    content="Discover your ideal sodium to potassium ratio, understand how it impacts blood pressure and heart health, and learn the best foods to improve your Na:K balance naturally."
  />

  <h2 itemProp="name" className="text-xl font-bold text-foreground">
    Sodium to Potassium Ratio: The Hidden Key to Heart and Nerve Health
  </h2>
  <p itemProp="description">
    Sodium and potassium are vital electrolytes that regulate fluid balance, nerve signals, and muscle contractions. But it’s not just about how much of each you consume — it’s about their <strong>ratio</strong>.  
    The <strong>Sodium to Potassium Ratio Calculator</strong> helps you analyze your daily intake and shows how close you are to the ideal balance recommended for heart health and blood pressure management.
  </p>

  <h3 className="font-semibold text-foreground mt-6">What Is the Sodium–Potassium Ratio?</h3>
  <p>
    The <strong>Na:K ratio</strong> compares how much sodium you consume relative to potassium.  
    - Sodium (Na) tends to raise blood pressure when consumed in excess.  
    - Potassium (K) helps relax blood vessels and counteracts sodium’s effects.  
    <br />Hence, a balanced Na:K ratio is more predictive of cardiovascular health than sodium or potassium alone.
  </p>

  <h3 className="font-semibold text-foreground mt-6">
    Ideal Sodium to Potassium Ratio
  </h3>
  <p>
    According to the <strong>World Health Organization (WHO)</strong> and major nutrition studies:
  </p>
  <ul className="list-disc ml-6 space-y-1">
    <li><strong>Ideal Na:K ratio:</strong> Less than <strong>1.0</strong></li>
    <li><strong>Optimal target:</strong> Around <strong>0.5</strong> (twice as much potassium as sodium)</li>
    <li><strong>Average modern diet:</strong> Around 2–3 (too much sodium, too little potassium)</li>
  </ul>
  <p>
    Keeping your ratio below 1 significantly reduces the risk of <strong>high blood pressure, kidney disease, stroke, and heart failure</strong>.
  </p>

  <h3 className="font-semibold text-foreground mt-6">
    Recommended Daily Intakes
  </h3>
  <ul className="list-disc ml-6 space-y-1">
    <li><strong>Sodium:</strong> Less than 2,000 mg/day (≈5 g salt)</li>
    <li><strong>Potassium:</strong> At least 3,500–4,700 mg/day</li>
  </ul>
  <p>
    Most people consume <strong>more than double the safe sodium limit</strong> and less than half the recommended potassium — leading to an unhealthy Na:K ratio.
  </p>

  <h3 className="font-semibold text-foreground mt-6">Why the Ratio Matters More Than Quantity</h3>
  <ul className="list-disc ml-6 space-y-1">
    <li><strong>Blood pressure regulation:</strong> Potassium blunts the pressor effect of sodium.</li>
    <li><strong>Heart function:</strong> A better Na:K ratio supports stable heart rhythm.</li>
    <li><strong>Kidney protection:</strong> Reduces strain on kidneys from excess sodium.</li>
    <li><strong>Fluid balance:</strong> Maintains hydration and prevents edema.</li>
    <li><strong>Metabolic health:</strong> Lowers risk of insulin resistance and stroke.</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">
    How the Sodium to Potassium Ratio Calculator Works
  </h3>
  <p>
    This calculator estimates your Na:K ratio based on daily sodium and potassium intake.  
    You can input values manually (from food logs, nutrition labels, or apps) or use general estimates to see if your diet is balanced.  
    - A ratio **below 1.0** → Excellent balance  
    - **1.0–2.0** → Needs improvement  
    - **Above 2.0** → High sodium risk zone
  </p>

  <h3 className="font-semibold text-foreground mt-6">
    Example: Calculating Your Na:K Ratio
  </h3>
  <p>
    Suppose you consume 3,000 mg sodium and 4,500 mg potassium per day.  
    The Na:K ratio = 3,000 ÷ 4,500 = <strong>0.67</strong> → Good balance.  
    But if you consume 4,000 mg sodium and only 2,500 mg potassium → Ratio = <strong>1.6</strong>, which indicates an unhealthy intake pattern.
  </p>

  <h3 className="font-semibold text-foreground mt-6">
    High-Sodium Foods to Watch Out For
  </h3>
  <ul className="list-disc ml-6 space-y-1">
    <li>Table salt and sea salt</li>
    <li>Packaged snacks and chips</li>
    <li>Processed meats (sausages, bacon, ham)</li>
    <li>Instant noodles and soups</li>
    <li>Bread, cheese, sauces, and pickles</li>
    <li>Restaurant and fast-food meals</li>
  </ul>
  <p>
    Even seemingly healthy foods like whole-grain bread or canned beans can have hidden sodium — always check labels.
  </p>

  <h3 className="font-semibold text-foreground mt-6">
    Potassium-Rich Foods to Improve Your Ratio
  </h3>
  <ul className="list-disc ml-6 space-y-1">
    <li><strong>Fruits:</strong> bananas, oranges, apricots, avocados, kiwis</li>
    <li><strong>Vegetables:</strong> spinach, sweet potatoes, mushrooms, tomatoes</li>
    <li><strong>Legumes:</strong> lentils, kidney beans, soybeans</li>
    <li><strong>Dairy:</strong> yogurt, milk</li>
    <li><strong>Nuts & seeds:</strong> pistachios, almonds, sunflower seeds</li>
    <li><strong>Whole grains:</strong> quinoa, oats, brown rice</li>
  </ul>
  <p>
    Aim for a variety of plant-based foods daily to boost potassium naturally and maintain electrolyte balance.
  </p>

  <h3 className="font-semibold text-foreground mt-6">
    Practical Tips to Improve Your Na:K Ratio
  </h3>
  <ul className="list-disc ml-6 space-y-1">
    <li>Cook more meals at home — you control the salt.</li>
    <li>Use herbs, lemon, and spices instead of salt for flavor.</li>
    <li>Read labels: choose products with “no added salt” or “low sodium.”</li>
    <li>Eat more fresh fruits and vegetables.</li>
    <li>Limit sauces, dressings, and ready-to-eat foods.</li>
    <li>Stay hydrated — proper water intake aids electrolyte regulation.</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">
    Health Effects of an Imbalanced Na:K Ratio
  </h3>
  <ul className="list-disc ml-6 space-y-1">
    <li>Hypertension (high blood pressure)</li>
    <li>Heart disease and stroke</li>
    <li>Kidney stones and chronic kidney disease</li>
    <li>Muscle cramps and weakness</li>
    <li>Fluid retention and bloating</li>
    <li>Increased risk of metabolic syndrome</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">
    Role of Sodium and Potassium in the Body
  </h3>
  <ul className="list-disc ml-6 space-y-1">
    <li><strong>Sodium:</strong> Maintains extracellular fluid, nerve impulses, and muscle contraction.</li>
    <li><strong>Potassium:</strong> Maintains intracellular fluid, stabilizes heart rhythm, and supports metabolism.</li>
  </ul>
  <p>
    Both are essential — the goal isn’t to eliminate sodium, but to restore a <strong>healthy ratio</strong> between the two.
  </p>

  <h3 className="font-semibold text-foreground mt-6">FAQ</h3>
  <div className="space-y-3">
    <p><strong>What’s the ideal sodium to potassium ratio?</strong> Less than 1.0 — meaning you should consume more potassium than sodium daily.</p>
    <p><strong>How much sodium is too much?</strong> More than 2,000 mg per day increases blood pressure risk.</p>
    <p><strong>What happens if I consume too much potassium?</strong> In healthy people, excess potassium is excreted via urine, but those with kidney issues should consult a doctor.</p>
    <p><strong>How can I naturally reduce sodium intake?</strong> Avoid processed foods, reduce salt during cooking, and flavor meals with herbs or lemon.</p>
    <p><strong>Can supplements fix the ratio?</strong> It’s best to balance through whole foods. Supplements should be used only if prescribed.</p>
  </div>

  <h3 className="font-semibold text-foreground mt-6">
    Related Calculators
  </h3>
  <div className="space-y-2">
    <p><Link href="/category/health-fitness/water-intake-calculator" className="text-primary underline">Water Intake Calculator</Link></p>
    <p><Link href="/category/health-fitness/magnesium-intake-calculator" className="text-primary underline">Magnesium Intake Calculator</Link></p>
    <p><Link href="/category/health-fitness/fiber-intake-calculator" className="text-primary underline">Fiber Intake Calculator</Link></p>
    <p><Link href="/category/health-fitness/zinc-requirement-calculator" className="text-primary underline">Zinc Requirement Calculator</Link></p>
  </div>

  <h3 className="font-semibold text-foreground mt-6">Quick Takeaways</h3>
  <ul className="list-disc ml-6 space-y-1">
    <li>The sodium-to-potassium ratio is a better predictor of heart health than sodium alone.</li>
    <li>Target a ratio below 1 (preferably around 0.5).</li>
    <li>Most processed foods raise sodium and worsen the ratio.</li>
    <li>Focus on fruits, vegetables, legumes, and whole grains to boost potassium naturally.</li>
    <li>Regularly monitor your Na:K ratio using the calculator to stay on track.</li>
  </ul>

  <p className="italic mt-4">
    Disclaimer: This calculator and guide are for general informational purposes only. For specific dietary recommendations or medical conditions like hypertension or kidney disease, consult your healthcare provider.
  </p>
</section>
  );
}


