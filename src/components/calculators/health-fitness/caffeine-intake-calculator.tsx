
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Coffee, PlusCircle, XCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const drinkTypes = {
  brewedCoffee: { name: 'Brewed Coffee (8 oz)', caffeine: 95 },
  espresso: { name: 'Espresso (1 oz)', caffeine: 64 },
  blackTea: { name: 'Black Tea (8 oz)', caffeine: 47 },
  greenTea: { name: 'Green Tea (8 oz)', caffeine: 28 },
  cola: { name: 'Cola (12 oz)', caffeine: 34 },
  energyDrink: { name: 'Energy Drink (8.4 oz)', caffeine: 80 },
};

const drinkSchema = z.object({
  type: z.string(),
  servings: z.number().int().nonnegative("Servings cannot be negative."),
});

const formSchema = z.object({
  drinks: z.array(drinkSchema).min(1, "Please add at least one item."),
});

type FormValues = z.infer<typeof formSchema>;

export default function CaffeineIntakeCalculator() {
  const [result, setResult] = useState<{ total: number; percent: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      drinks: [{ type: 'brewedCoffee', servings: undefined }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "drinks"
  });

  const onSubmit = (values: FormValues) => {
    const totalCaffeine = values.drinks.reduce((sum, drink) => {
        const caloriesPerServing = drinkTypes[drink.type as keyof typeof drinkTypes].caffeine;
        return sum + ((drink.servings || 0) * caloriesPerServing);
    }, 0);
    const safeLimit = 400;
    const percent = (totalCaffeine / safeLimit) * 100;
    setResult({ total: totalCaffeine, percent });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Your Caffeinated Drinks</CardTitle></CardHeader>
            <CardContent>
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[1fr,80px,auto] gap-2 items-start mb-2">
                  <FormField control={form.control} name={`drinks.${index}.type`} render={({ field }) => (
                    <FormItem><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                        <SelectContent>{Object.entries(drinkTypes).map(([key, val]) => <SelectItem key={key} value={key}>{val.name}</SelectItem>)}</SelectContent>
                    </Select></FormItem>
                  )} />
                   <FormField control={form.control} name={`drinks.${index}.servings`} render={({ field }) => (
                    <FormItem><FormControl><Input type="number" placeholder="Qty" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl></FormItem>
                  )} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><XCircle className="h-5 w-5 text-destructive" /></Button>
                </div>
              ))}
               <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ type: 'brewedCoffee', servings: undefined })}><PlusCircle className="mr-2 h-4 w-4" /> Add Drink</Button>
            </CardContent>
          </Card>
          <Button type="submit">Calculate Caffeine</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Coffee className="h-8 w-8 text-primary" /><CardTitle>Daily Caffeine Intake</CardTitle></div></CardHeader>
          <CardContent className="text-center">
            <p className="text-3xl font-bold">{result.total.toLocaleString()} mg / 400 mg</p>
            <CardDescription className="mt-2">You have consumed {result.percent.toFixed(0)}% of the recommended safe daily limit.</CardDescription>
            <div className="w-full bg-muted rounded-full h-4 mt-4 overflow-hidden">
                <div className="bg-primary h-4" style={{ width: `${Math.min(100, result.percent)}%` }}></div>
            </div>
          </CardContent>
        </Card>
      )}
       <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
    <meta itemProp="headline" content="Caffeine Intake Calculator Guide: Safe Daily Limits (400mg), Hidden Sources, and Health Effects" />
    <meta itemProp="author" content="Your Website/Health Team Name" />
    <meta itemProp="about" content="A comprehensive guide to calculating safe daily caffeine intake, understanding the FDA-recommended 400mg limit, identifying hidden caffeine sources, and managing side effects and withdrawal." />

    <h1 className="text-2xl font-bold text-foreground mb-4">The Ultimate Caffeine Intake Calculator Guide: Tracking Your Daily Limit (400mg)</h1>
    
    <p><em><strong>Disclaimer:</strong> This guide is for informational and educational purposes only and is not a substitute for professional medical advice. Individuals who are pregnant, breastfeeding, or have pre-existing health conditions (especially heart or anxiety disorders) should consult a healthcare provider for personalized caffeine limits.</em></p>

    <h2 className="text-xl font-bold text-foreground mt-8">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-1">
        <li><a href="#intro">The Science of Caffeine: Why We Track Intake</a></li>
        <li><a href="#safe-limits">Official Guidelines: The Safe Daily Caffeine Limit (400mg)</a></li>
        <li><a href="#calculator-use">How the Caffeine Intake Calculator Works</a></li>
        <li><a href="#hidden">The Hidden Caffeine Threat: Sources You Miss</a></li>
        <li><a href="#side-effects">When to Cut Back: Signs of Excessive Caffeine Intake</a></li>
        <li><a href="#withdrawal">Caffeine Withdrawal and How to Reduce Intake Safely</a></li>
    </ul>

    <h2 id="intro" itemProp="name" className="text-xl font-bold text-foreground mt-8">The Science of Caffeine: Why We Track Intake</h2>
    <p itemProp="description">Caffeine is the world's most widely consumed psychoactive substance. It works by blocking **adenosine receptors** in the brain, preventing the chemical that causes drowsiness from docking. This results in the temporary feeling of alertness, focus, and reduced fatigue we associate with coffee and energy drinks.</p>

    <p>While moderate intake is safe and often beneficial—improving athletic performance and cognitive function—excessive consumption carries significant health risks. A **Caffeine Intake Calculator** is a vital tool for preventing the negative consequences of overconsumption by helping users quantify their daily dose in milligrams (mg), which is the only reliable way to manage intake.</p>

    <h3 className="font-semibold text-foreground mt-6">Caffeine's Half-Life: The Time Factor</h3>
    <p>Understanding the body's processing time is crucial for preventing sleeplessness. Caffeine has an average **half-life of about five hours**. This means if you consume 200mg at 2:00 PM, you still have 100mg active in your bloodstream at 7:00 PM. Experts recommend avoiding caffeine intake within **6 to 8 hours of bedtime** to ensure optimal sleep quality.</p>

    <h2 id="safe-limits" className="text-xl font-bold text-foreground mt-8">Official Guidelines: The Safe Daily Caffeine Limit (400mg)</h2>
    <p>Major international health authorities provide clear maximum guidelines for daily caffeine consumption, which form the basis for any reliable intake calculator.</p>

    <h3 className="font-semibold text-foreground mt-6">Maximum Recommended Daily Intake (mg)</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Healthy Adults:** **Up to 400 mg** per day is the widely accepted safe upper limit (FDA, EFSA, Mayo Clinic). This is approximately the amount found in four standard 8-ounce cups of brewed coffee.</li>
        <li>**Pregnant or Breastfeeding Women:** **No more than 200 mg** per day. Many clinicians advise erring on the side of caution due to concerns about increased miscarriage risk and potential effects on the fetus.</li>
        <li>**Adolescents (Ages 12-18):** Health Canada suggests limiting intake to **2.5 mg per kilogram of body weight** per day (e.g., 85 mg for a 10-12 year old). High caffeine levels in energy drinks are strongly advised against for this age group.</li>
    </ul>
    
    <h3 className="font-semibold text-foreground mt-6">Caffeine Tolerance: A Personal Metric</h3>
    <p>It is important to note that the 400 mg limit is an average. Individual sensitivity varies widely based on genetics, body weight, and liver function. Some people experience jitters and anxiety at just 100 mg, while others tolerate much higher doses without noticeable side effects. The calculator helps users find their personal "safe zone," not just the official limit.</p>

    <h2 id="calculator-use" className="text-xl font-bold text-foreground mt-8">How the Caffeine Intake Calculator Works</h2>
    <p>A functional Caffeine Intake Calculator must do more than just add up numbers; it must account for the enormous variability of caffeine across different beverages and brands.</p>

    <h3 className="font-semibold text-foreground mt-6">Variability in Common Sources (Approximate mg per 8 fl oz / 237ml)</h3>
    <p>The caffeine content of the same beverage type can vary significantly based on brewing time, roast, and bean type. These wide ranges necessitate tracking by volume and type:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Brewed Coffee (Regular):** 95 to 200 mg (A large specialty coffee can easily exceed 300 mg).</li>
        <li>**Espresso (1 oz shot):** 63 mg.</li>
        <li>**Black Tea (Brewed):** 40 to 60 mg.</li>
        <li>**Green Tea (Brewed):** 25 to 45 mg.</li>
        <li>**Energy Drink (Standard 8 oz):** 70 to 150 mg (though many cans are 16 oz or more).</li>
        <li>**Cola Soda (12 oz can):** 35 to 45 mg.</li>
        <li>**Decaf Coffee:** 2 to 15 mg (It is not caffeine-free, but negligible).</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">Calculation Output Value</h3>
    <p>The core output should provide a clear comparison against the recommended limit:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Current Running Total (mg):** The cumulative amount of caffeine consumed throughout the day.</li>
        <li>**Remaining Safe Dose (mg):** How much caffeine the user can consume before hitting the 400mg limit.</li>
        <li>**Time-of-Day Alert:** Warnings if the user is consuming caffeine too close to their specified bedtime.</li>
    </ul>

    <h2 id="hidden" className="text-xl font-bold text-foreground mt-8">The Hidden Caffeine Threat: Sources You Miss</h2>
    <p>One of the biggest pitfalls of daily tracking is missing non-obvious caffeine sources. Relying only on coffee and tea can lead to accidental overconsumption.</p>

    <h3 className="font-semibold text-foreground mt-6">Unexpected Sources to Track</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Medication (Over-the-Counter):** Many pain relievers (especially those targeting migraines and tension headaches) contain high amounts of caffeine (often 60 mg to 130 mg per dose) to enhance the effects of the painkiller.</li>
        <li>**Chocolate and Cocoa Products:** Dark chocolate contains a notable amount of caffeine (about 12 mg per ounce).</li>
        <li>**Protein Bars and Snacks:** Some "energy" or protein bars marketed for pre-workout fuel may have added caffeine.</li>
        <li>**Weight Loss Supplements:** Many dietary and weight loss supplements contain high, often unregulated, amounts of caffeine or caffeine-like compounds (e.g., guarana, yerba mate).</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">The Extreme Danger of Pure Caffeine Powder</h3>
    <p>The FDA has issued warnings about **pure powdered caffeine**. One teaspoon of pure caffeine powder is roughly equivalent to the caffeine content of **28 cups of coffee** (approximately 5,000 mg or 5 grams). This is a potentially lethal dose, as pure caffeine is impossible to measure accurately at home. **These highly concentrated products must be avoided entirely.**</p>

    <h2 id="side-effects" className="text-xl font-bold text-foreground mt-8">When to Cut Back: Signs of Excessive Caffeine Intake</h2>
    <p>Even if you are below the 400mg limit, if you experience any of the following symptoms, it is a clear sign that your personal caffeine threshold has been crossed.</p>

    <h3 className="font-semibold text-foreground mt-6">Common Adverse Effects</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Jitteriness and Nervousness:** Physical tremor, restlessness, and anxiety that interferes with normal function.</li>
        <li>**Insomnia and Poor Sleep Quality:** Difficulty falling asleep, staying asleep, or waking up feeling unrefreshed (often the most common side effect).</li>
        <li>**Gastrointestinal Distress:** Nausea, stomach upset, or aggravation of conditions like Irritable Bowel Syndrome (IBS) due to increased gastric acid production.</li>
        <li>**Cardiovascular Symptoms:** Increased heart rate (tachycardia) and heart palpitations. While generally not harmful in healthy individuals, this requires immediate medical attention if severe or persistent.</li>
        <li>**Increased Urination:** Caffeine is a diuretic, leading to more frequent trips to the restroom and potential mild dehydration.</li>
    </ul>
    
    <h2 id="withdrawal" className="text-xl font-bold text-foreground mt-8">Caffeine Withdrawal and How to Reduce Intake Safely</h2>
    <p>Suddenly cutting back on caffeine can lead to withdrawal symptoms, which typically peak around 24 to 48 hours after the last dose, but can last for up to nine days.</p>

    <h3 className="font-semibold text-foreground mt-6">Common Withdrawal Symptoms</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Headaches:** Often severe and throbbing, this is the most common withdrawal symptom.</li>
        <li>**Fatigue and Drowsiness:** Extreme tiredness, low energy, and difficulty staying alert.</li>
        <li>**Irritability:** Mood swings, general grumpiness, and difficulty concentrating.</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">Strategies for Safe Reduction (Gradual Tapering)</h3>
    <p>The best strategy for reducing intake is a slow, gradual taper to minimize withdrawal severity:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**The 25% Rule:** Reduce your daily consumption by only 25% every week. This allows your body to slowly adjust to lower levels.</li>
        <li>**Switch to Decaf Blends:** Gradually mix decaf coffee with regular coffee over several weeks until you are drinking mostly or entirely decaf.</li>
        <li>**Shorten Brew Time:** For tea, reduce the steeping time to cut caffeine content. For brewed coffee, opt for a light roast, which typically has less caffeine than a darker roast.</li>
        <li>**Hydrate:** Drink plenty of water. Water helps alleviate dehydration and may reduce headache severity during withdrawal.</li>
    </ul>

    <div className="text-sm italic text-center mt-8 pt-4 border-t border-gray-200">
        <p>This guide compiles recommendations and data from the U.S. Food and Drug Administration (FDA), the European Food Safety Agency (EFSA), and the Mayo Clinic on safe caffeine consumption limits and side effects.</p>
    </div>
</section>
    </div>
  );
}
