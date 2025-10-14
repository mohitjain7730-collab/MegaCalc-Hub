'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Utensils } from 'lucide-react';
import { EmbedWidget } from '@/components/embed-widget';

const formSchema = z.object({
  age: z.number().int().min(1).max(120),
  sex: z.enum(['male', 'female']),
});

type FormValues = z.infer<typeof formSchema>;

function rdaCalciumMg(age: number, sex: 'male' | 'female'): number {
  // Simplified NIH/ODS values
  if (age >= 1 && age <= 3) return 700;
  if (age >= 4 && age <= 8) return 1000;
  if (age >= 9 && age <= 18) return 1300;
  if (age >= 19 && age <= 50) return 1000;
  if (age >= 51 && sex === 'female') return 1200;
  if (age >= 71) return 1200;
  return 1000;
}

export default function CalciumIntakeCalculator() {
  const [result, setResult] = useState<number | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { age: undefined, sex: 'female' } });
  const onSubmit = (values: FormValues) => setResult(rdaCalciumMg(values.age, values.sex));

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="age" render={({ field }) => (<FormItem><FormLabel>Age (years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="sex" render={({ field }) => (<FormItem><FormLabel>Sex</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent></Select></FormItem>)} />
          </div>
          <Button type="submit">Calculate Calcium RDA</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Utensils className="h-8 w-8 text-primary" /><CardTitle>Recommended Daily Calcium</CardTitle></div></CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold">{result} mg/day</p>
              <CardDescription>Approximate Dietary Reference Intake. Individual needs vary.</CardDescription>
            </div>
          </CardContent>
        </Card>
      )}
      <CalciumIntakeGuide />
      <EmbedWidget calculatorSlug="calcium-intake-calculator" calculatorName="Calcium Intake Calculator" />
    </div>
  );
}

export function CalciumIntakeGuide() {
  return (
    <section
  className="space-y-4 text-muted-foreground leading-relaxed"
  itemScope
  itemType="https://schema.org/Article"
>
  <meta
    itemProp="headline"
    content="Calcium Intake Calculator – Complete Guide to Daily Requirements, Bone Health, and Food Sources"
  />
  <meta itemProp="author" content="MegaCalc Hub Team" />
  <meta
    itemProp="about"
    content="Understand your calcium needs by age, gender, and life stage. Learn about absorption factors, vitamin D interaction, oxalates, food vs supplements, safety, and how to maintain optimal bone density."
  />

  <h2 itemProp="name" className="text-xl font-bold text-foreground">
    Calcium Intake: Why It Matters and How to Get It Right
  </h2>
  <p itemProp="description">
    Calcium is one of the most essential minerals for human health, playing a
    critical role in maintaining strong bones and teeth, regulating muscle
    contractions, supporting nerve transmission, and aiding in blood clotting.
    It’s not just about milk — your daily calcium intake depends on your age,
    lifestyle, vitamin D levels, and the foods you eat. This comprehensive guide
    explains <strong>how much calcium you need</strong>, where to get it from,
    how absorption works, and how to use the <strong>Calcium Intake
    Calculator</strong> to track your intake effectively.
  </p>

  <h3 className="font-semibold text-foreground mt-6">
    Recommended Daily Calcium Intake (RDA)
  </h3>
  <p>
    The recommended dietary allowance (RDA) for calcium varies by age, gender,
    and life stage. These values are based on guidelines from the
    <strong> National Institutes of Health (NIH)</strong> and
    <strong> World Health Organization (WHO)</strong>.
  </p>
  <ul className="list-disc ml-6 space-y-1">
    <li>Infants 0–6 months: 200 mg/day</li>
    <li>Infants 7–12 months: 260 mg/day</li>
    <li>Children 1–3 years: 700 mg/day</li>
    <li>Children 4–8 years: 1,000 mg/day</li>
    <li>Adolescents 9–18 years: 1,300 mg/day</li>
    <li>Adults 19–50 years: 1,000 mg/day</li>
    <li>Women 51+ years: 1,200 mg/day</li>
    <li>Men 71+ years: 1,200 mg/day</li>
    <li>Pregnant & Lactating Teens: 1,300 mg/day</li>
    <li>Pregnant & Lactating Adults: 1,000 mg/day</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">
    Why Calcium Is So Important
  </h3>
  <p>
    Around <strong>99% of your body’s calcium</strong> is stored in bones and
    teeth, providing them with structure and strength. The remaining 1% is
    involved in crucial biological functions such as:
  </p>
  <ul className="list-disc ml-6 space-y-1">
    <li>
      <strong>Muscle contraction:</strong> Calcium ions enable muscles to
      contract, including the heart.
    </li>
    <li>
      <strong>Nerve function:</strong> Calcium helps transmit nerve impulses.
    </li>
    <li>
      <strong>Blood clotting:</strong> It activates enzymes that are essential
      for normal coagulation.
    </li>
    <li>
      <strong>Cell communication:</strong> Acts as a messenger for many hormonal
      and enzymatic reactions.
    </li>
  </ul>
  <p>
    When dietary calcium is low, the body pulls calcium from the bones to
    maintain blood levels — leading to weakened bone density and increased risk
    of <strong>osteoporosis</strong> over time.
  </p>

  <h3 className="font-semibold text-foreground mt-6">
    Calcium Absorption and Vitamin D
  </h3>
  <p>
    Your body can only use the calcium it absorbs. Vitamin D plays a crucial
    role in this process — it promotes calcium absorption in the gut and
    maintains appropriate blood levels. Without adequate vitamin D, even a
    calcium-rich diet won’t provide full benefits.
  </p>
  <ul className="list-disc ml-6 space-y-1">
    <li>
      <strong>Vitamin D synergy:</strong> Get regular sun exposure or check out
      the{" "}
      <Link
        href="/category/health-fitness/vitamin-d-sun-exposure-calculator"
        className="text-primary underline"
      >
        Vitamin D Sun Exposure Calculator
      </Link>{" "}
      to estimate your daily requirements.
    </li>
    <li>
      <strong>Meal timing:</strong> Calcium carbonate absorbs best when taken
      with food, while calcium citrate can be taken anytime.
    </li>
    <li>
      <strong>Absorption limit:</strong> The body absorbs calcium most
      efficiently when doses are under 500 mg at a time.
    </li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">
    Foods Rich in Calcium
  </h3>
  <p>
    Getting calcium from food is always preferred over supplements. Here’s a
    breakdown of top calcium sources across various diets:
  </p>
  <ul className="list-disc ml-6 space-y-1">
    <li>
      <strong>Dairy:</strong> Milk, yogurt, cheese (≈300 mg per cup of milk or
      yogurt)
    </li>
    <li>
      <strong>Fortified foods:</strong> Soy milk, almond milk, orange juice, and
      breakfast cereals fortified with calcium
    </li>
    <li>
      <strong>Leafy greens:</strong> Kale, collard greens, bok choy, and turnip
      greens (avoid high-oxalate ones like spinach)
    </li>
    <li>
      <strong>Legumes:</strong> Chickpeas, lentils, and white beans
    </li>
    <li>
      <strong>Fish with bones:</strong> Sardines and salmon (canned with bones)
    </li>
    <li>
      <strong>Tofu and tempeh:</strong> Especially if made with calcium sulfate
    </li>
    <li>
      <strong>Nuts & seeds:</strong> Almonds, sesame seeds, and chia seeds
    </li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">
    Oxalates, Phytates, and Absorption Inhibitors
  </h3>
  <p>
    Certain compounds in plant foods — especially <strong>oxalates</strong> and
    <strong> phytates</strong> — can bind calcium and make it less absorbable.
    Foods high in oxalates include spinach, beet greens, and rhubarb, while
    phytates are found in whole grains and legumes. You don’t need to avoid them
    entirely — instead, pair them with low-oxalate vegetables and vitamin
    C-rich foods to boost absorption.
  </p>
  <p>
    Cooking, soaking, or fermenting these foods can also reduce their
    anti-nutrient levels and improve bioavailability.
  </p>

  <h3 className="font-semibold text-foreground mt-6">
    Calcium Needs in Special Situations
  </h3>
  <ul className="list-disc ml-6 space-y-1">
    <li>
      <strong>Pregnancy & breastfeeding:</strong> The body becomes more
      efficient at absorbing calcium, but maintaining intake (~1,000–1,300 mg)
      is crucial to protect maternal bone density.
    </li>
    <li>
      <strong>Postmenopausal women:</strong> Estrogen decline accelerates bone
      loss, increasing calcium and vitamin D needs.
    </li>
    <li>
      <strong>Athletes:</strong> High physical stress and sweat calcium losses
      may warrant slightly higher intakes.
    </li>
    <li>
      <strong>Vegans:</strong> Should rely on fortified plant milks, tofu, and
      calcium-set foods to meet RDA levels.
    </li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">
    Sample Daily Menus for Adequate Calcium
  </h3>
  <ul className="list-disc ml-6 space-y-1">
    <li>
      <strong>Breakfast:</strong> Oatmeal with fortified soy milk + chia seeds +
      orange slices (≈400 mg)
    </li>
    <li>
      <strong>Lunch:</strong> Chickpea salad with kale, tahini dressing, and a
      small yogurt (≈400 mg)
    </li>
    <li>
      <strong>Dinner:</strong> Grilled salmon with bones + sautéed bok choy +
      quinoa (≈500 mg)
    </li>
    <li>
      <strong>Snack:</strong> Handful of almonds or a fortified smoothie (≈200
      mg)
    </li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">
    Calcium Supplements: When and How to Use Them
  </h3>
  <p>
    Supplements are useful when dietary intake is insufficient, but they’re not
    a substitute for a balanced diet. Always prioritize food-based sources first
    and consult a healthcare provider before adding supplements.
  </p>
  <ul className="list-disc ml-6 space-y-1">
    <li>
      <strong>Calcium carbonate:</strong> Higher elemental calcium but needs
      stomach acid — best taken with meals.
    </li>
    <li>
      <strong>Calcium citrate:</strong> Easier to digest, suitable for people on
      antacids or with absorption issues.
    </li>
    <li>
      <strong>Dosage tip:</strong> Split doses into ≤500 mg portions for better
      uptake.
    </li>
    <li>
      <strong>Safety:</strong> Excessive supplementation ({'>'}2,000–2,500 mg/day)
      may increase risk of kidney stones or vascular calcification.
    </li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">
    Signs of Calcium Deficiency
  </h3>
  <p>
    Mild calcium deficiency may go unnoticed, but chronic low levels can lead to
    muscle cramps, brittle nails, tingling in fingers, and bone demineralization
    over time. In children, it can impair growth; in adults, it raises the risk
    of osteoporosis and fractures.
  </p>

  <h3 className="font-semibold text-foreground mt-6">
    How the Calculator Works
  </h3>
  <p>
    The <strong>Calcium Intake Calculator</strong> estimates your recommended
    calcium intake based on age, sex, and physiological stage. It compares your
    dietary inputs (like milk, tofu, nuts, etc.) with RDA levels to show how
    close you are to meeting your daily needs. These are general guidelines; for
    medical advice or bone health concerns, consult a registered dietitian or
    healthcare professional.
  </p>

  <h3 className="font-semibold text-foreground mt-6">Quick FAQs</h3>
  <div className="space-y-3">
    <p>
      <strong>Can you get too much calcium?</strong> Yes. Excessive intake from
      supplements may lead to kidney stones and affect heart health. Stick to
      the upper limit (2,000–2,500 mg/day).
    </p>
    <p>
      <strong>Do plant sources provide enough calcium?</strong> Yes, especially
      when you include fortified plant milks, tofu, and leafy greens low in
      oxalates.
    </p>
    <p>
      <strong>Does caffeine or sodium affect calcium?</strong> High caffeine and
      sodium intake can increase calcium excretion. Balance with hydration and
      nutrient-rich foods.
    </p>
  </div>

  <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
  <div className="space-y-2">
    <p>
      <Link
        href="/category/health-fitness/vitamin-d-sun-exposure-calculator"
        className="text-primary underline"
      >
        Vitamin D Sun Exposure Calculator
      </Link>
    </p>
    <p>
      <Link
        href="/category/health-fitness/magnesium-intake-calculator"
        className="text-primary underline"
      >
        Magnesium Intake Calculator
      </Link>
    </p>
    <p>
      <Link
        href="/category/health-fitness/fiber-intake-calculator"
        className="text-primary underline"
      >
        Fiber Intake Calculator
      </Link>
    </p>
    <p>
      <Link
        href="/category/health-fitness/bmi-calculator"
        className="text-primary underline"
      >
        BMI Calculator
      </Link>
    </p>
  </div>

  <p className="italic">
    Disclaimer: This guide is for educational purposes only. Calcium needs vary
    by individual health status. Always consult your doctor or registered
    dietitian before starting supplements or major dietary changes.
  </p>
</section>
  );
}


