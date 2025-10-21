'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const sweatRates = {
    low: 0.5,
    moderate: 1.0,
    high: 1.5,
};

const saltinessLevels = {
    low: 500,
    average: 900,
    salty: 1500,
};

const formSchema = z.object({
  duration: z.number().positive(),
  sweatRate: z.string(),
  sweatType: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ElectrolyteReplacementCalculator() {
  const [result, setResult] = useState<{ sodium: number; potassium: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      duration: undefined,
      sweatRate: 'moderate',
      sweatType: 'average',
    },
  });

  const onSubmit = (values: FormValues) => {
    const sweatRateMultiplier = sweatRates[values.sweatRate as keyof typeof sweatRates];
    const totalSweatLoss = values.duration * sweatRateMultiplier;
    
    const sodiumConcentration = saltinessLevels[values.sweatType as keyof typeof saltinessLevels];
    const totalSodiumLoss = totalSweatLoss * sodiumConcentration;
    
    const totalPotassiumLoss = totalSweatLoss * 200;

    setResult({ sodium: totalSodiumLoss, potassium: totalPotassiumLoss });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="duration" render={({ field }) => (
                <FormItem><FormLabel>Duration of Exercise (hours)</FormLabel><FormControl><Input type="number" step="0.5" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="sweatRate" render={({ field }) => (
                <FormItem><FormLabel>Sweat Rate Intensity</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="moderate">Moderate</SelectItem><SelectItem value="high">High</SelectItem></SelectContent>
                </Select>
                </FormItem>
            )} />
             <FormField control={form.control} name="sweatType" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Sweat Saltiness</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent><SelectItem value="low">Low (Rarely see salt stains)</SelectItem><SelectItem value="average">Average (Sometimes see salt stains)</SelectItem><SelectItem value="salty">Salty (Often see salt stains)</SelectItem></SelectContent>
                </Select>
                </FormItem>
            )} />
          </div>
          <Button type="submit">Estimate Loss</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Droplets className="h-8 w-8 text-primary" /><CardTitle>Estimated Electrolyte Loss</CardTitle></div></CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                        <p className="font-semibold">Sodium</p>
                        <p className="text-2xl font-bold">{result.sodium.toLocaleString()} mg</p>
                    </div>
                     <div>
                        <p className="font-semibold">Potassium</p>
                        <p className="text-2xl font-bold">{result.potassium.toLocaleString()} mg</p>
                    </div>
                </div>
                <CardDescription className='mt-4 text-center'>Replenish gradually through a balanced diet and properly formulated sports drinks during and after your activity.</CardDescription>
            </CardContent>
        </Card>
      )}
       <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
    <meta itemProp="headline" content="Electrolyte Replacement Calculator Guide: Calculating Sodium & Potassium Needs for Exercise and Hydration" />
    <meta itemProp="author" content="Your Website/Health Team Name" />
    <meta itemProp="about" content="A comprehensive guide to using an Electrolyte Replacement Calculator, focusing on the calculation of fluid and sodium loss (sweat rate), optimal electrolyte concentrations for sports drinks, and recognizing symptoms of hyponatremia and hypokalemia." />

    <h1 className="text-2xl font-bold text-foreground mb-4">The Ultimate Electrolyte Replacement Calculator Guide: Hydration, Sweat Rate, and Performance</h1>
    
    <p><em><strong>Disclaimer:</strong> This guide provides educational content based on sports physiology and medical consensus (ACSM, Cleveland Clinic). It is not a substitute for medical diagnosis or treatment. Consult a healthcare provider for any severe symptoms or chronic electrolyte imbalance.</em></p>

    <h2 className="text-xl font-bold text-foreground mt-8">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-1">
        <li><a href="#intro">The Role of Electrolytes: Fluid, Nerve, and Muscle Function</a></li>
        <li><a href="#sweat-rate">Calculating Fluid Loss: The Sweat Rate Formula</a></li>
        <li><a href="#replacement">Electrolyte Replacement Protocol: Sodium, Potassium, Magnesium</a></li>
        <li><a href="#imbalance">Dangers of Imbalance: Hyponatremia and Hyperkalemia</a></li>
        <li><a href="#calculator-use">How the Replacement Calculator Works</a></li>
        <li><a href="#sports-nutrition">Optimizing Sports Drinks: Concentration Guidelines</a></li>
        <li><a href="#conclusion">Keys to Maintaining Euhydration and Performance</a></li>
    </ul>

    <h2 id="intro" itemProp="name" className="text-xl font-bold text-foreground mt-8">The Role of Electrolytes: Fluid, Nerve, and Muscle Function</h2>
    <p itemProp="description">Electrolytes are essential minerals—primarily **Sodium, Potassium, Chloride, Calcium, and Magnesium**—that carry an electrical charge when dissolved in the body's fluids. They are vital for nearly every physiological process, including regulating nerve impulses, triggering muscle contractions, and maintaining the critical balance of fluid inside and outside your cells.</p>

    <p>The primary reason for using an **Electrolyte Replacement Calculator** is to accurately replenish minerals lost through **sweat**, especially during prolonged or high-intensity exercise in hot environments. Failure to replace these losses can lead to dehydration, muscle cramping, performance decline, and, in severe cases, dangerous conditions like **hyponatremia** (low sodium).</p>

    <h3 className="font-semibold text-foreground mt-6">The Three Most Crucial Electrolytes for Athletes</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Sodium (Na+):** The single most abundant electrolyte lost in sweat. It controls total body water and aids nerve and muscle function. Replacement is critical.</li>
        <li>**Potassium (K+):** Essential for maintaining fluid balance inside the cells and necessary for proper muscle contraction.</li>
        <li>**Magnesium (Mg2+):** Key for muscle relaxation and preventing cramping; losses can exacerbate fatigue.</li>
    </ul>

    <h2 id="sweat-rate" className="text-xl font-bold text-foreground mt-8">Calculating Fluid Loss: The Sweat Rate Formula</h2>
    <p>Individual sweat rates vary wildly (from 0.5 to 3.0 liters per hour) based on genetics, intensity, fitness level, and climate. The calculator bases its replacement strategy on accurately estimating this individual loss.</p>

    <h3 className="font-semibold text-foreground mt-6">The Gold Standard Sweat Rate Protocol</h3>
    <p>To accurately determine the fluid volume you need to replace, follow this protocol:</p>
    <pre><code>Sweat Rate (L/hour) = [ (Pre-Exercise Weight &minus; Post-Exercise Weight) + Fluid Consumed ] &divide; Time Exercised</code></pre>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Weight Difference:** Weigh yourself (nude or in minimal clothing) immediately before and after a 1-hour exercise session. Every 1 kg (2.2 lbs) lost equates to 1 Liter of sweat loss.</li>
        <li>**Fluid Consumed:** Measure and account for any fluid you drank during the session, adding it back to your loss calculation.</li>
        <li>**Goal:** Your goal during exercise is to replace 70% to 100% of this calculated fluid loss.</li>
    </ul>

    <h2 id="replacement" className="text-xl font-bold text-foreground mt-8">Electrolyte Replacement Protocol: Sodium, Potassium, Magnesium</h2>
    <p>Once fluid loss is calculated, the next step is determining the specific mineral amounts needed, particularly sodium, which is lost most abundantly.</p>

    <h3 className="font-semibold text-foreground mt-6">Sodium (Na+) Replacement Guidelines</h3>
    <p>Sodium replacement is critical for stimulating thirst and helping the body retain ingested fluid (preventing excessive urination).</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Standard Recommendation (Per Liter of Fluid):** **460 to 1,150 mg of Sodium** (or 20–50 mEq/L) per liter of fluid consumed during endurance exercise (ACSM, NSCA guidelines).</li>
        <li>**"Salty Sweaters":** Individuals who notice white residue on their clothes after exercise or who get frequent cramps may require sodium at the high end of this range or higher.</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">Potassium and Magnesium Replacement</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Potassium (K+):** While less abundant in sweat than sodium, potassium is essential. Sports drinks generally aim for **78 to 195 mg** (or 2–5 mEq/L) per liter. Replacement is key for muscle function and glycogen storage.</li>
        <li>**Magnesium (Mg2+):** Though lost in trace amounts, inadequate magnesium can worsen muscle cramping and fatigue. Consistent dietary intake from sources like nuts and leafy greens is essential, and targeted supplementation may be beneficial if cramps are chronic.</li>
    </ul>

    <h2 id="imbalance" className="text-xl font-bold text-foreground mt-8">Dangers of Imbalance: Hyponatremia and Hyperkalemia</h2>
    <p>An electrolyte imbalance occurs when mineral levels are too high or too low, often caused by extreme fluid loss (dehydration) or, paradoxically, by overhydration with plain water.</p>

    <h3 className="font-semibold text-foreground mt-6">Hyponatremia (Low Sodium) – A Critical Risk</h3>
    <p>This life-threatening condition occurs primarily in endurance athletes who drink large amounts of plain water *without* adequate sodium replacement. The water dilutes the blood's sodium concentration, leading to symptoms:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Symptoms:** Confusion, disorientation, severe nausea/vomiting, extreme fatigue, and in severe cases, seizures or cerebral edema.</li>
        <li>**Prevention:** The calculator helps prevent this by ensuring fluid replacement is paired with adequate sodium intake (e.g., salty snacks or high-sodium sports drinks).</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">Other Imbalance Symptoms</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Hypokalemia (Low Potassium):** Muscle weakness, fatigue, and muscle cramps.</li>
        <li>**Hyperkalemia (High Potassium):** While rare in healthy people, often caused by kidney issues or medication, symptoms can include heart palpitations or an irregular heartbeat.</li>
        <li>**General Imbalance:** Headaches, lightheadedness, and irregular heart rate.</li>
    </ul>

    <h2 id="calculator-use" className="text-xl font-bold text-foreground mt-8">How the Replacement Calculator Works</h2>
    <p>A sophisticated electrolyte replacement calculator synthesizes three inputs to provide an actionable fluid plan:</p>

    <h3 className="font-semibold text-foreground mt-6">Key Calculation Inputs</h3>
    <ol className="list-decimal ml-6 space-y-1">
        <li>**Body Mass Loss (kg or lbs):** The pre- and post-exercise weight difference, which determines total fluid deficit.</li>
        <li>**Exercise Duration (hours):** Used to normalize the replacement amount to an hourly intake rate.</li>
        <li>**Sweat Sodium Estimate (mg/L):** An optional, but highly personalized, input that may be estimated based on the user's tendency toward "salty sweating."</li>
    </ol>

    <h3 className="font-semibold text-foreground mt-6">Post-Exercise Rehydration Goal (The 150% Rule)</h3>
    <p>To ensure full recovery, post-exercise rehydration should replace **150%** of the fluid mass lost. This excess volume is needed to account for inevitable losses via urination during the recovery period.</p>
    <pre><code>Fluid Needs (L) = Body Mass Loss (kg) &times; 1.5</code></pre>
    <p>The calculator then translates this total fluid need into a timeline for consumption over the next 2–6 hours, paired with the necessary amount of electrolytes.</p>

    <h2 id="sports-nutrition" className="text-xl font-bold text-foreground mt-8">Optimizing Sports Drinks: Concentration Guidelines</h2>
    <p>For endurance exercise lasting longer than 45–60 minutes, a standard sports drink is often superior to water alone because it provides the optimal balance of electrolytes and carbohydrates.</p>

    <h3 className="font-semibold text-foreground mt-6">Isotonic, Hypotonic, and Hypertonic Solutions</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Isotonic:** Contains a carbohydrate and electrolyte concentration similar to human blood (e.g., 6–8% carbohydrates). Ideal for most endurance activities; provides fluid, electrolytes, and energy.</li>
        <li>**Hypotonic:** Contains a lower concentration than blood. Primarily for rapid fluid absorption; less energy dense.</li>
        <li>**Hypertonic:** Contains a higher concentration than blood. Primarily used *after* exercise or in ultra-endurance for rapid glycogen and calorie replenishment, often combined with water.</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">Carbohydrate Concentration</h3>
    <p>Most experts recommend a carbohydrate concentration of **6% to 8%** in sports beverages consumed *during* exercise. Higher concentrations (above 8%) can slow gastric emptying, leading to stomach distress and impaired fluid absorption.</p>

    <h2 id="conclusion" className="text-xl font-bold text-foreground mt-8">Keys to Maintaining Euhydration and Performance</h2>
    <p>The **Electrolyte Replacement Calculator** empowers athletes to move beyond simple thirst and utilize a scientific approach to fluid balance. Maintaining a state of **euhydration** (normal fluid and electrolyte balance) is the baseline for high performance. By calculating your personal sweat rate and ensuring targeted sodium replacement, you can prevent dangerous imbalances, mitigate cramping, and support your body’s critical muscular and neurological functions.</p>
    
    <div className="text-sm italic text-center mt-8 pt-4 border-t border-gray-200">
        <p>This guide is compiled using guidelines from the American College of Sports Medicine (ACSM), the National Strength and Conditioning Association (NSCA), and medical resources regarding electrolyte balance and performance in high-exertion environments.</p>
    </div>
</section>
    </div>
  );
}
