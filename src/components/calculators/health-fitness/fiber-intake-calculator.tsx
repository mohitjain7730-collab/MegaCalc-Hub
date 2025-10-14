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

const formSchema = z.object({ calories: z.number().positive() });
type FormValues = z.infer<typeof formSchema>;

export default function FiberIntakeCalculator() {
  const [result, setResult] = useState<number | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { calories: undefined } });
  const onSubmit = (values: FormValues) => setResult((values.calories / 1000) * 14);

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="calories" render={({ field }) => (
            <FormItem><FormLabel>Daily Calories</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
          )} />
          <Button type="submit">Calculate Fiber Goal</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Utensils className="h-8 w-8 text-primary" /><CardTitle>Daily Fiber Target</CardTitle></div></CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold">{Math.round(result)} g/day</p>
              <CardDescription>Based on 14 g per 1,000 kcal guideline.</CardDescription>
            </div>
          </CardContent>
        </Card>
      )}
      <FiberIntakeGuide />
    </div>
  );
}

export function FiberIntakeGuide() {
  return (
    <section
  className="space-y-4 text-muted-foreground leading-relaxed"
  itemScope
  itemType="https://schema.org/Article"
>
  <meta
    itemProp="headline"
    content="Fiber Intake Calculator – Complete Guide to Daily Fiber Requirements, Soluble vs Insoluble Fiber, Food Sources, and Gut Health"
  />
  <meta itemProp="author" content="MegaCalc Hub Team" />
  <meta
    itemProp="about"
    content="Learn everything about dietary fiber—recommended daily intake by age and gender, the difference between soluble and insoluble fiber, top high-fiber foods, digestion benefits, and tips for improving gut health."
  />

  <h2 itemProp="name" className="text-xl font-bold text-foreground">
    Fiber 101: The Unsung Hero of Digestive and Metabolic Health
  </h2>
  <p itemProp="description">
    Dietary fiber is the indigestible part of plant foods that supports <strong>gut health, blood sugar balance, cholesterol reduction, and long-term weight management</strong>. Despite its importance, most people consume less than half of the recommended daily fiber.  
    Use this <strong>Fiber Intake Calculator</strong> to find out how much fiber you need based on your age and gender, and learn how to meet your target naturally through delicious, fiber-rich meals.
  </p>

  <h3 className="font-semibold text-foreground mt-6">
    Daily Fiber Requirements (RDA)
  </h3>
  <p>
    The <strong>Dietary Reference Intake (DRI)</strong> for fiber is based on total caloric intake. Below is a simplified daily target guide from the U.S. National Academy of Medicine:
  </p>
  <ul className="list-disc ml-6 space-y-1">
    <li>Children 1–3 years: ~19 g/day</li>
    <li>Children 4–8 years: ~25 g/day</li>
    <li>Boys 9–13 years: ~31 g/day</li>
    <li>Girls 9–13 years: ~26 g/day</li>
    <li>Men 14–50 years: ~38 g/day</li>
    <li>Women 14–50 years: ~25 g/day</li>
    <li>Men 51+ years: ~30 g/day</li>
    <li>Women 51+ years: ~21 g/day</li>
    <li>Pregnancy: ~28 g/day</li>
    <li>Lactation: ~29 g/day</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">Why Fiber Is Important</h3>
  <ul className="list-disc ml-6 space-y-1">
    <li><strong>Supports Gut Health:</strong> Fiber feeds beneficial gut bacteria that help with immunity and digestion.</li>
    <li><strong>Regulates Blood Sugar:</strong> Slows down glucose absorption, reducing sugar spikes.</li>
    <li><strong>Lowers Cholesterol:</strong> Soluble fiber binds cholesterol in the gut, aiding its removal.</li>
    <li><strong>Promotes Fullness:</strong> High-fiber meals keep you satisfied longer, aiding weight control.</li>
    <li><strong>Prevents Constipation:</strong> Insoluble fiber adds bulk to stool, promoting regular bowel movements.</li>
    <li><strong>May Reduce Risk of Disease:</strong> Higher fiber intake is linked to lower risk of heart disease, diabetes, and colon cancer.</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">
    Soluble vs Insoluble Fiber: What’s the Difference?
  </h3>
  <p>
    Fiber comes in two main types, each offering unique benefits:
  </p>
  <ul className="list-disc ml-6 space-y-1">
    <li>
      <strong>Soluble fiber:</strong> Dissolves in water, forming a gel-like substance. Found in oats, beans, fruits, and flaxseeds. Helps control cholesterol and blood sugar.
    </li>
    <li>
      <strong>Insoluble fiber:</strong> Adds bulk to stool and supports bowel regularity. Found in whole grains, nuts, seeds, and vegetables.
    </li>
  </ul>
  <p>
    For optimal health, aim for a mix of both—roughly <strong>70% insoluble and 30% soluble fiber</strong> is ideal for most people.
  </p>

  <h3 className="font-semibold text-foreground mt-6">Top High-Fiber Foods</h3>
  <ul className="list-disc ml-6 space-y-1">
    <li><strong>Legumes:</strong> lentils (15 g/cup), black beans (15 g/cup), chickpeas (12 g/cup)</li>
    <li><strong>Whole grains:</strong> oats (4 g/cup), barley (6 g/cup), quinoa (5 g/cup), brown rice (3.5 g/cup)</li>
    <li><strong>Fruits:</strong> raspberries (8 g/cup), pears (5.5 g), apples with skin (4.5 g), bananas (3 g)</li>
    <li><strong>Vegetables:</strong> broccoli (5 g/cup), carrots (4 g/cup), sweet potatoes (4 g with skin)</li>
    <li><strong>Nuts & seeds:</strong> chia seeds (10 g/oz), flaxseeds (7 g/oz), almonds (3.5 g/oz)</li>
    <li><strong>Fiber-fortified foods:</strong> certain cereals, whole-grain breads, and bars</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">
    Sample High-Fiber Meal Plan
  </h3>
  <ul className="list-disc ml-6 space-y-1">
    <li><strong>Breakfast:</strong> Oatmeal topped with chia seeds, banana, and almonds (~10 g)</li>
    <li><strong>Snack:</strong> Apple with peanut butter (~5 g)</li>
    <li><strong>Lunch:</strong> Lentil soup with a side of whole-grain bread (~12 g)</li>
    <li><strong>Dinner:</strong> Quinoa salad with chickpeas, roasted vegetables, and avocado (~13 g)</li>
    <li><strong>Total:</strong> ~40 g fiber for the day — meeting daily needs easily!</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">
    How to Use the Fiber Intake Calculator
  </h3>
  <p>
    This tool estimates your <strong>ideal daily fiber requirement</strong> based on <strong>age, gender, and calorie needs</strong>.  
    Input your details to get personalized recommendations and compare them to your current diet. It helps ensure you’re meeting your fiber target for optimal digestion and health.
  </p>

  <h3 className="font-semibold text-foreground mt-6">
    Tips to Increase Fiber Intake
  </h3>
  <ul className="list-disc ml-6 space-y-1">
    <li>Gradually increase fiber to prevent bloating and gas.</li>
    <li>Drink plenty of water—fiber works best when hydrated.</li>
    <li>Replace refined grains with whole grains (e.g., white rice → brown rice).</li>
    <li>Add beans or lentils to soups, curries, or salads.</li>
    <li>Snack on fruits, nuts, or raw vegetables instead of processed items.</li>
    <li>Include seeds like flax or chia in smoothies, yogurt, or oatmeal.</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">
    Fiber and Gut Microbiome
  </h3>
  <p>
    Fiber acts as a <strong>prebiotic</strong>—food for your gut’s beneficial bacteria. These microbes ferment soluble fibers to produce short-chain fatty acids (SCFAs) like <strong>butyrate</strong> and <strong>propionate</strong>, which help:
  </p>
  <ul className="list-disc ml-6 space-y-1">
    <li>Maintain gut lining integrity</li>
    <li>Reduce inflammation</li>
    <li>Enhance immune response</li>
    <li>Support healthy body weight</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">
    Fiber Supplements – When and How to Use
  </h3>
  <ul className="list-disc ml-6 space-y-1">
    <li>
      <strong>When needed:</strong> If diet alone isn’t enough or for conditions like constipation, IBS, or cholesterol management.
    </li>
    <li>
      <strong>Common forms:</strong> psyllium husk (soluble), methylcellulose, inulin, or wheat dextrin.
    </li>
    <li>
      <strong>Dosage:</strong> Usually 5–10 g once or twice daily with water.
    </li>
    <li>
      <strong>Safety:</strong> Increase gradually and hydrate well to avoid discomfort.
    </li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">
    Common Signs of Low Fiber Intake
  </h3>
  <ul className="list-disc ml-6 space-y-1">
    <li>Irregular bowel movements or constipation</li>
    <li>Bloating or digestive discomfort</li>
    <li>Frequent hunger even after meals</li>
    <li>Elevated cholesterol or blood sugar levels</li>
    <li>Low energy and sluggish metabolism</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">FAQ</h3>
  <div className="space-y-3">
    <p><strong>How much fiber should I eat per day?</strong> Most adults need 25–38 grams daily depending on gender and calorie intake. Our calculator provides a personalized estimate.</p>
    <p><strong>What’s the best source of fiber?</strong> Legumes, fruits with skin, whole grains, nuts, and seeds offer a mix of soluble and insoluble fiber.</p>
    <p><strong>Can I eat too much fiber?</strong> Extremely high intakes (>60 g/day) may cause bloating or reduce mineral absorption. Increase gradually.</p>
    <p><strong>Does fiber help with weight loss?</strong> Yes, fiber increases satiety, slows digestion, and stabilizes blood sugar, all supporting healthy weight management.</p>
    <p><strong>Does cooking reduce fiber?</strong> Cooking slightly softens fiber but doesn’t significantly reduce total content. Steaming retains the most fiber.</p>
  </div>

  <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
  <div className="space-y-2">
    <p><Link href="/category/health-fitness/calorie-intake-calculator" className="text-primary underline">Calorie Intake Calculator</Link></p>
    <p><Link href="/category/health-fitness/magnesium-intake-calculator" className="text-primary underline">Magnesium Intake Calculator</Link></p>
    <p><Link href="/category/health-fitness/zinc-requirement-calculator" className="text-primary underline">Zinc Requirement Calculator</Link></p>
    <p><Link href="/category/health-fitness/water-intake-calculator" className="text-primary underline">Water Intake Calculator</Link></p>
  </div>

  <h3 className="font-semibold text-foreground mt-6">
    Quick Takeaways
  </h3>
  <ul className="list-disc ml-6 space-y-1">
    <li>Most people eat less than 50% of their required daily fiber.</li>
    <li>Combine soluble and insoluble fiber for best digestive results.</li>
    <li>Hydration is key—fiber without water can worsen constipation.</li>
    <li>Eating a rainbow of plant foods ensures diverse fiber types and better gut health.</li>
  </ul>

  <p className="italic mt-4">
    Disclaimer: This calculator and article are for informational purposes only. For personalized dietary or medical advice, consult your healthcare professional.
  </p>
</section>
  );
}
