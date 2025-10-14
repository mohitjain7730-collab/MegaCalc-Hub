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

const formSchema = z.object({ age: z.number().int().min(1).max(120), sex: z.enum(['male', 'female']) });
type FormValues = z.infer<typeof formSchema>;

function rdaZincMg(age: number, sex: 'male' | 'female'): number {
  if (age >= 1 && age <= 3) return 3;
  if (age >= 4 && age <= 8) return 5;
  if (age >= 9 && age <= 13) return 8;
  if (age >= 14 && age <= 18) return sex === 'male' ? 11 : 9;
  return sex === 'male' ? 11 : 8;
}

export default function ZincRequirementCalculator() {
  const [result, setResult] = useState<number | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { age: undefined, sex: 'male' } });
  const onSubmit = (values: FormValues) => setResult(rdaZincMg(values.age, values.sex));

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="age" render={({ field }) => (<FormItem><FormLabel>Age (years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="sex" render={({ field }) => (<FormItem><FormLabel>Sex</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent></Select></FormItem>)} />
          </div>
          <Button type="submit">Calculate Zinc RDA</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Utensils className="h-8 w-8 text-primary" /><CardTitle>Recommended Daily Zinc</CardTitle></div></CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold">{result} mg/day</p>
              <CardDescription>Approximate RDA based on age and sex.</CardDescription>
            </div>
          </CardContent>
        </Card>
      )}
      <ZincRequirementGuide />
      <EmbedWidget calculatorSlug="zinc-requirement-calculator" calculatorName="Zinc Requirement Calculator" />
    </div>
  );
}

export function ZincRequirementGuide() {
  return (
    <section
  className="space-y-4 text-muted-foreground leading-relaxed"
  itemScope
  itemType="https://schema.org/Article"
>
  <meta
    itemProp="headline"
    content="Zinc Requirement Calculator – Complete Guide to Daily Needs, Deficiency Symptoms, and Food Sources"
  />
  <meta itemProp="author" content="MegaCalc Hub Team" />
  <meta
    itemProp="about"
    content="Find out how much zinc you need daily based on age, gender, and life stage. Learn about zinc-rich foods, absorption factors, immune benefits, deficiency symptoms, and when to consider supplements."
  />

  <h2 itemProp="name" className="text-xl font-bold text-foreground">
    Zinc Intake: The Essential Mineral for Immunity, Growth, and Repair
  </h2>
  <p itemProp="description">
    Zinc is a trace mineral your body needs in small but critical amounts. It’s
    involved in over <strong>300 enzyme reactions</strong> that support immune
    function, wound healing, DNA synthesis, taste, and reproduction. Your body
    doesn’t store zinc, so you must consume it daily through food or
    supplementation. This complete guide explains <strong>how much zinc you
    need</strong>, <strong>best dietary sources</strong>, <strong>absorption
    factors</strong>, and how the <strong>Zinc Requirement Calculator</strong>
    helps you track and optimize intake.
  </p>

  <h3 className="font-semibold text-foreground mt-6">
    Recommended Daily Zinc Intake (RDA)
  </h3>
  <p>
    The daily recommended intake of zinc depends on age, gender, and life stage.
    These values are based on data from the{" "}
    <strong>National Institutes of Health (NIH)</strong> and the{" "}
    <strong>World Health Organization (WHO)</strong>.
  </p>

  <table className="w-full border border-gray-200 text-sm mt-4">
    <thead>
      <tr className="bg-muted">
        <th className="border p-2 text-left">Age / Group</th>
        <th className="border p-2 text-left">Recommended Intake (mg/day)</th>
      </tr>
    </thead>
    <tbody>
      <tr><td className="border p-2">Infants 0–6 months</td><td className="border p-2">2 mg</td></tr>
      <tr><td className="border p-2">Infants 7–12 months</td><td className="border p-2">3 mg</td></tr>
      <tr><td className="border p-2">Children 1–3 years</td><td className="border p-2">3 mg</td></tr>
      <tr><td className="border p-2">Children 4–8 years</td><td className="border p-2">5 mg</td></tr>
      <tr><td className="border p-2">Boys 9–13 years</td><td className="border p-2">8 mg</td></tr>
      <tr><td className="border p-2">Girls 9–13 years</td><td className="border p-2">8 mg</td></tr>
      <tr><td className="border p-2">Men 14+ years</td><td className="border p-2">11 mg</td></tr>
      <tr><td className="border p-2">Women 14–18 years</td><td className="border p-2">9 mg</td></tr>
      <tr><td className="border p-2">Women 19+ years</td><td className="border p-2">8 mg</td></tr>
      <tr><td className="border p-2">Pregnant teens</td><td className="border p-2">12 mg</td></tr>
      <tr><td className="border p-2">Pregnant adults</td><td className="border p-2">11 mg</td></tr>
      <tr><td className="border p-2">Lactating women</td><td className="border p-2">12–13 mg</td></tr>
    </tbody>
  </table>

  <h3 className="font-semibold text-foreground mt-6">
    Why Zinc Matters for Your Health
  </h3>
  <ul className="list-disc ml-6 space-y-1">
    <li><strong>Immune system support:</strong> Zinc boosts T-cell activity and helps fight infections and viruses.</li>
    <li><strong>Wound healing:</strong> It aids tissue repair and is often used in skin creams and medical ointments.</li>
    <li><strong>DNA synthesis and growth:</strong> Zinc is crucial for cell division and growth during childhood, adolescence, and pregnancy.</li>
    <li><strong>Hormone balance:</strong> Supports testosterone production and reproductive health.</li>
    <li><strong>Taste and smell:</strong> Zinc deficiency is linked to loss of taste or smell (common after viral infections).</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">
    Zinc Deficiency: Symptoms and Risks
  </h3>
  <p>
    Zinc deficiency affects nearly <strong>1 in 3 people worldwide</strong>,
    especially in regions with limited access to animal foods. Even mild
    deficiency can cause noticeable symptoms:
  </p>
  <ul className="list-disc ml-6 space-y-1">
    <li>Weakened immunity and frequent colds</li>
    <li>Delayed wound healing</li>
    <li>Hair loss or thinning</li>
    <li>Loss of appetite or taste</li>
    <li>Skin rashes or acne-like eruptions</li>
    <li>Stunted growth in children</li>
    <li>Fertility issues in men and women</li>
  </ul>
  <p>
    Populations at risk include <strong>vegans, vegetarians, athletes,
    pregnant women, and older adults</strong>, due to either low intake or poor
    absorption.
  </p>

  <h3 className="font-semibold text-foreground mt-6">
    Zinc Absorption and Bioavailability
  </h3>
  <p>
    Not all dietary zinc is absorbed equally. The bioavailability of zinc (how
    much your body can actually use) depends on your diet’s composition and the
    presence of certain compounds.
  </p>
  <ul className="list-disc ml-6 space-y-1">
    <li><strong>Animal-based zinc (from meat and seafood)</strong> is more easily absorbed than plant-based sources.</li>
    <li><strong>Phytates</strong> in whole grains, legumes, and seeds bind zinc and reduce absorption.</li>
    <li><strong>Cooking, soaking, or fermenting</strong> foods can help reduce phytate levels and improve bioavailability.</li>
    <li><strong>Iron and calcium supplements</strong> can compete with zinc for absorption if taken simultaneously.</li>
    <li><strong>Protein intake</strong> improves zinc utilization by enhancing intestinal transport mechanisms.</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">
    Top Zinc-Rich Foods
  </h3>
  <p>
    You can meet your daily zinc requirements naturally through a balanced diet.
    Here are the richest sources of zinc across different food categories:
  </p>
  <ul className="list-disc ml-6 space-y-1">
    <li><strong>Seafood:</strong> Oysters (best source), crab, lobster, and shrimp</li>
    <li><strong>Meat:</strong> Beef, lamb, pork, and poultry (dark meat contains more zinc)</li>
    <li><strong>Legumes:</strong> Chickpeas, lentils, and black beans (enhance absorption by soaking)</li>
    <li><strong>Nuts & seeds:</strong> Pumpkin seeds, cashews, hemp seeds, and almonds</li>
    <li><strong>Whole grains:</strong> Oats, quinoa, and brown rice (contain moderate amounts)</li>
    <li><strong>Dairy:</strong> Cheese and milk provide small but bioavailable zinc</li>
    <li><strong>Fortified foods:</strong> Many cereals and plant-based milks are fortified with zinc</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">
    Sample Daily Menu to Meet Zinc Needs
  </h3>
  <ul className="list-disc ml-6 space-y-1">
    <li><strong>Breakfast:</strong> Fortified oatmeal with milk and pumpkin seeds (≈4 mg)</li>
    <li><strong>Lunch:</strong> Chickpea salad with tahini dressing and whole-grain bread (≈3 mg)</li>
    <li><strong>Dinner:</strong> Grilled salmon or chicken + quinoa + steamed broccoli (≈5 mg)</li>
    <li><strong>Snack:</strong> Handful of mixed nuts or a fortified bar (≈2 mg)</li>
  </ul>
  <p>Total: ≈14 mg zinc — enough for most adults.</p>

  <h3 className="font-semibold text-foreground mt-6">
    Zinc Supplements: When They’re Needed
  </h3>
  <p>
    While most people can meet their needs through diet, supplements may help if
    you’re deficient or have higher physiological demands. Always check with a
    healthcare provider before supplementing.
  </p>
  <ul className="list-disc ml-6 space-y-1">
    <li><strong>Common forms:</strong> Zinc gluconate, zinc citrate, and zinc picolinate (the most bioavailable).</li>
    <li><strong>Dosage:</strong> 8–11 mg/day from all sources; avoid exceeding 40 mg/day (upper safe limit).</li>
    <li><strong>Over-supplementation risks:</strong> High doses can cause nausea, copper deficiency, and lowered immunity.</li>
    <li><strong>Timing:</strong> Take supplements with food to reduce stomach upset.</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">
    How the Zinc Requirement Calculator Works
  </h3>
  <p>
    The <strong>Zinc Requirement Calculator</strong> uses your age, gender, and
    physiological condition (pregnant, lactating, athlete, etc.) to estimate
    your daily zinc requirement. It helps you identify if you’re meeting your
    recommended dietary allowance (RDA) based on your diet.
  </p>
  <p>
    You can enter foods you consume daily — such as meat, legumes, seeds, and
    fortified cereals — and the calculator automatically estimates total zinc
    intake. It’s especially useful for vegetarians and athletes who need to
    track nutrient intake closely.
  </p>

  <h3 className="font-semibold text-foreground mt-6">
    Zinc and Immunity: The Evidence
  </h3>
  <p>
    Zinc plays a vital role in immune cell production and signaling. Research
    shows that maintaining optimal zinc levels can reduce the duration and
    severity of common colds and respiratory infections. Zinc lozenges and
    supplementation have shown benefits when used at the onset of illness.
  </p>
  <p>
    However, excessive zinc intake can suppress immune function, so balance is
    key. The calculator helps users stay within the safe and effective range.
  </p>

  <h3 className="font-semibold text-foreground mt-6">
    Zinc in Vegetarians and Vegans
  </h3>
  <p>
    Plant-based eaters are more prone to mild zinc deficiency because plant
    foods contain phytates that reduce absorption. To improve zinc status:
  </p>
  <ul className="list-disc ml-6 space-y-1">
    <li>Soak or sprout beans and grains to lower phytate content.</li>
    <li>Include fermented foods like tempeh and sourdough bread.</li>
    <li>Consume zinc-fortified cereals, tofu, and plant-based milks.</li>
    <li>Pair zinc-rich foods with vitamin C-rich ingredients for better uptake.</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">
    Zinc and Other Nutrients: Interactions
  </h3>
  <ul className="list-disc ml-6 space-y-1">
    <li><strong>Copper:</strong> Excess zinc reduces copper absorption; many supplements include both.</li>
    <li><strong>Iron:</strong> High iron intake may interfere with zinc uptake.</li>
    <li><strong>Calcium:</strong> Competes with zinc when taken in large supplemental doses.</li>
    <li><strong>Vitamin A:</strong> Zinc helps mobilize vitamin A from the liver; deficiency affects vision and immunity.</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">
    Quick FAQs
  </h3>
  <div className="space-y-3">
    <p><strong>Can you take zinc daily?</strong> Yes, but stay within recommended limits (8–11 mg/day). Excessive use can cause nausea or copper imbalance.</p>
    <p><strong>Does zinc help prevent colds?</strong> Zinc supports immune function and may reduce the duration of colds when taken early.</p>
    <p><strong>Which zinc form is best absorbed?</strong> Zinc picolinate and zinc citrate have the highest absorption rates.</p>
    <p><strong>Can too much zinc cause hair loss?</strong> Ironically, both low and excessively high zinc levels can contribute to hair thinning.</p>
    <p><strong>What reduces zinc absorption?</strong> Phytates in grains and legumes; reduce by soaking, sprouting, or fermenting foods.</p>
  </div>

  <h3 className="font-semibold text-foreground mt-6">
    Related Tools
  </h3>
  <div className="space-y-2">
    <p><Link href="/category/health-fitness/magnesium-intake-calculator" className="text-primary underline">Magnesium Intake Calculator</Link></p>
    <p><Link href="/category/health-fitness/iron-intake-calculator" className="text-primary underline">Iron Requirement Calculator</Link></p>
    <p><Link href="/category/health-fitness/vitamin-d-sun-exposure-calculator" className="text-primary underline">Vitamin D Sun Exposure Calculator</Link></p>
    <p><Link href="/category/health-fitness/fiber-intake-calculator" className="text-primary underline">Fiber Intake Calculator</Link></p>
  </div>

  <p className="italic">
    Disclaimer: This content is for educational purposes only and should not be
    used as medical advice. Always consult a qualified healthcare professional
    before making changes to your diet or supplement routine.
  </p>
</section>
  );
}