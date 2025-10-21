
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassWater, PlusCircle, XCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const drinkTypes = {
  standardBeer: { name: 'Standard Beer (12 oz)', calories: 153 },
  lightBeer: { name: 'Light Beer (12 oz)', calories: 103 },
  redWine: { name: 'Red Wine (5 oz)', calories: 125 },
  whiteWine: { name: 'White Wine (5 oz)', calories: 121 },
  spirit: { name: 'Spirit (1.5 oz, 80-proof)', calories: 97 },
};

const drinkSchema = z.object({
  type: z.string(),
  servings: z.number().int().nonnegative("Servings cannot be negative.").optional(),
});

const formSchema = z.object({
  drinks: z.array(drinkSchema).min(1, "Please add at least one drink."),
});

type FormValues = z.infer<typeof formSchema>;

export default function AlcoholCalorieImpactCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      drinks: [{ type: 'standardBeer', servings: undefined }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "drinks"
  });

  const onSubmit = (values: FormValues) => {
    const totalCalories = values.drinks.reduce((sum, drink) => {
        const caloriesPerServing = drinkTypes[drink.type as keyof typeof drinkTypes].calories;
        return sum + ((drink.servings || 0) * caloriesPerServing);
    }, 0);
    setResult(totalCalories);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Your Drinks</CardTitle></CardHeader>
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
               <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ type: 'standardBeer', servings: undefined })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Drink
              </Button>
            </CardContent>
          </Card>
          <Button type="submit">Calculate Calories</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><GlassWater className="h-8 w-8 text-primary" /><CardTitle>Total Calorie Impact</CardTitle></div></CardHeader>
          <CardContent className="text-center">
            <p className="text-3xl font-bold">{result.toLocaleString()} kcal</p>
            <CardDescription className="mt-2">This represents {(result / 2300 * 100).toFixed(0)}% of a 2,300 calorie daily diet.</CardDescription>
          </CardContent>
        </Card>
      )}
       <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
    <meta itemProp="headline" content="Alcohol Calorie Impact Calculator Guide: Tracking Hidden Calories and Weight Gain Risk" />
    <meta itemProp="author" content="Your Website/Health Team Name" />
    <meta itemProp="about" content="A comprehensive guide to calculating the calories in alcohol (7 kcal/gram), its impact on TDEE and fat burning, the risks of liquid calories, and strategies for reducing consumption to aid weight loss and improve health." />

    <h1 className="text-2xl font-bold text-foreground mb-4">The Ultimate Alcohol Calorie Impact Calculator Guide: Uncovering Hidden Calories and Weight Risk</h1>
    
    <p><em><strong>Disclaimer:</strong> This guide provides educational information on the caloric and metabolic effects of alcohol. No amount of alcohol consumption is considered completely safe. If you have concerns about your drinking habits, seek professional help from a healthcare provider or addiction specialist.</em></p>

    <h2 className="text-xl font-bold text-foreground mt-8">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-1">
        <li><a href="#intro">The Hidden Calorie Bomb: Alcohol's Energy Density</a></li>
        <li><a href="#formula">Calculating Alcohol Calories: The 7 kcal/gram Rule</a></li>
        <li><a href="#calories-by-drink">Calories in Common Alcoholic Beverages</a></li>
        <li><a href="#metabolic-impact">Metabolic Impact: How Alcohol Stops Fat Burning</a></li>
        <li><a href="#weight-gain">The Four Ways Alcohol Contributes to Weight Gain</a></li>
        <li><a href="#guidelines">Health Guidelines and Safe Drinking Limits</a></li>
        <li><a href="#strategies">Actionable Strategies to Reduce Alcohol Calories</a></li>
    </ul>

    <h2 id="intro" itemProp="name" className="text-xl font-bold text-foreground mt-8">The Hidden Calorie Bomb: Alcohol's Energy Density</h2>
    <p itemProp="description">For anyone tracking calories or working toward a **calorie deficit**, alcoholic beverages represent a significant, yet often overlooked, source of high-density energy. The **Alcohol Calorie Impact Calculator** serves to quantify this consumption, translating weekly drinks into the stark reality of monthly and yearly caloric totals that can easily sabotage weight management goals.</p>

    <p>Unlike carbohydrates and protein, which contain 4 calories per gram, pure ethanol (alcohol) contains **7 calories per gram**. This makes it nearly as energy-dense as pure fat (9 calories per gram), yet it offers little-to-no nutritional value (often called **"empty calories"**). When weight gain is a concern, addressing these liquid calories is often the single most effective intervention.</p>

    <h2 id="formula" className="text-xl font-bold text-foreground mt-8">Calculating Alcohol Calories: The 7 kcal/gram Rule</h2>
    <p>The total calorie count of an alcoholic beverage is determined by two factors: the pure alcohol content (ethanol) and the sugars/carbohydrates remaining from the fermentation process or added as mixers.</p>

    <h3 className="font-semibold text-foreground mt-6">The Core Formula (Ethanol Calories Only)</h3>
    <p>The primary caloric load comes from the alcohol itself, calculated using its density and energy value. The calculator utilizes the following formula to estimate the energy from pure ethanol:</p>
    <pre><code>Alcohol Calories = Volume (mL) &times; ABV (%) &times; 0.8 (Density) &times; 7 (kcal/g)</code></pre>
    <p>This reveals the core caloric impact. The final calorie total for a drink is this ethanol value **PLUS** any calories from residual sugars, starches, or mixers.</p>

    <h3 className="font-semibold text-foreground mt-6">The Mixer Multiplier</h3>
    <p>Often, the added calories from mixers surpass those of the alcohol itself. Common calorie-dense mixers include:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Regular Soda/Cola:** Adds ~140 calories per 12 oz.</li>
        <li>**Juices:** Adds 110–170 calories per 8 oz.</li>
        <li>**Syrups and Liqueurs:** Found in cocktails (e.g., margaritas, piña coladas), these can push the total calorie count well over 300 per drink.</li>
    </ul>

    <h2 id="calories-by-drink" className="text-xl font-bold text-foreground mt-8">Calories in Common Alcoholic Beverages</h2>
    <p>To accurately use the calculator, it's vital to recognize the sheer caloric variability between drink types and strengths (ABV - Alcohol by Volume).</p>

    <h3 className="font-semibold text-foreground mt-6">Typical Calorie Ranges (Approximate)</h3>
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Drink Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Serving Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Approx. Calories (kcal)</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300"><strong>Standard Wine (12% ABV)</strong></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">5 fl oz (148 mL)</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">120 – 130</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300"><strong>Standard Beer/Lager (5% ABV)</strong></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">1 Pint (~473 mL)</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">180 – 220</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300"><strong>Distilled Spirits (80 Proof / 40% ABV)</strong></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">1.5 fl oz (44 mL)</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">95 – 100</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300"><strong>Classic Margarita/Cocktail</strong></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Standard Serving</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">200 – 350+</td>
                </tr>
            </tbody>
        </table>
    </div>
    <p className="citation"><em>Note: Higher ABV percentages lead to higher calorie counts from ethanol. Sweet wines and pre-mixed cocktails carry the highest sugar/carb burden.</em></p>

    <h2 id="metabolic-impact" className="text-xl font-bold text-foreground mt-8">Metabolic Impact: How Alcohol Stops Fat Burning</h2>
    <p>Beyond the simple calorie count, alcohol fundamentally alters the body’s metabolism, making it significantly harder to utilize stored fat for energy. This effect is independent of the resulting calorie surplus.</p>

    <h3 className="font-semibold text-foreground mt-6">Alcohol is a Metabolic Priority</h3>
    <p>The body cannot store alcohol; it recognizes ethanol as a toxin that must be processed immediately. When alcohol enters the liver, the body prioritizes breaking it down ahead of all other macronutrients (carbohydrates, fats, and protein). This means:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Fat Oxidation Stops:** The body's fat-burning process (**fat oxidation**) essentially shuts down. While the liver is busy clearing the alcohol, dietary fats consumed alongside the alcohol are shunted directly into storage.</li>
        <li>**Metabolic Rate Changes:** The metabolism of alcohol (ethanol) is highly complex, involving pathways (like the Microsomal Ethanol Oxidizing System) that can lead to an inefficient extraction of usable energy, creating a metabolic chaos that favors fat storage.</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">Nutrient Absorption and Muscle Synthesis</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Nutrient Depletion:** Alcohol consumption can impair the absorption of vital micronutrients, including B vitamins (Thiamin, Folate) and Zinc, which are essential for overall energy metabolism and immune function.</li>
        <li>**Muscle Growth:** Alcohol can interfere with the hormones and cellular processes required for **Muscle Protein Synthesis (MPS)**, potentially compromising muscle recovery and growth, even if a person is in a calorie surplus.</li>
    </ul>

    <h2 id="weight-gain" className="text-xl font-bold text-foreground mt-8">The Four Ways Alcohol Contributes to Weight Gain</h2>
    <p>The relationship between alcohol and increased body weight (particularly **abdominal fat**) is complex but well-documented, operating through both caloric and behavioral channels:</p>

    <h3 className="font-semibold text-foreground mt-6">1. Pure Caloric Overload</h3>
    <p>Regular consumption of high-calorie drinks, especially cocktails and large servings of beer or wine, can push a person into a calorie surplus without them realizing it. Four large glasses of wine per week add nearly 700 calories—enough to derail a 500-calorie deficit strategy.</p>

    <h3 className="font-semibold text-foreground mt-6">2. Increased Hunger and Cravings</h3>
    <p>Alcohol affects hunger hormones and brain signaling pathways (like GABA and Opioids), which often stimulates appetite and reduces inhibitions. This leads to intense cravings for energy-dense, salty, and greasy "drunk foods" (e.g., pizza, chips), further contributing to a positive energy balance.</p>

    <h3 className="font-semibold text-foreground mt-6">3. Reduced Fat Burning (Metabolic Block)</h3>
    <p>As detailed above, the immediate prioritization of alcohol metabolism by the liver forces the body to stop oxidizing fat, favoring fat storage instead.</p>

    <h3 className="font-semibold text-foreground mt-6">4. Disrupted Sleep and Recovery</h3>
    <p>While alcohol may induce initial drowsiness, it severely disrupts later stages of sleep (REM cycle). Poor sleep is associated with increased cortisol (stress hormone) levels, which promotes fat storage, particularly visceral fat around the abdomen.</p>

    <h2 id="guidelines" className="text-xl font-bold text-foreground mt-8">Health Guidelines and Safe Drinking Limits</h2>
    <p>Monitoring consumption is essential for both weight management and long-term health, as alcohol is linked to increased risk of cancer, liver disease, high blood pressure, and stroke.</p>

    <h3 className="font-semibold text-foreground mt-6">Low-Risk Drinking Guidelines (U.S. / UK Consensus)</h3>
    <p>To reduce the risk of harm from alcohol-related disease or injury, major health bodies recommend the following:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Men:** No more than **two drinks** in any one day, and no more than **14 drinks** per week.</li>
        <li>**Women:** No more than **one drink** in any one day, and no more than **7 drinks** per week.</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">Zero-Tolerance Recommendations</h3>
    <p>It is recommended to avoid all alcohol if you are:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Pregnant or trying to become pregnant.</li>
        <li>Under 21 years of age.</li>
        <li>Taking medications that interact negatively with alcohol (e.g., certain antibiotics or pain relievers).</li>
        <li>Managing a medical condition that alcohol can worsen (e.g., liver disease, pancreatitis, high triglycerides).</li>
    </ul>

    <h2 id="strategies" className="text-xl font-bold text-foreground mt-8">Actionable Strategies to Reduce Alcohol Calories</h2>
    <p>The calculator provides the data; these strategies provide the roadmap to integrate that information into your lifestyle for weight management:</p>

    <h3 className="font-semibold text-foreground mt-6">Smart Swaps and Habits</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Swap Mixers:** Replace sugary sodas and juices with low-calorie or zero-calorie alternatives (e.g., diet soda, sparkling water, light tonic).</li>
        <li>**Hydrate Between Drinks:** Drink a glass of water for every alcoholic beverage consumed. This reduces dehydration, slows intake, and increases satiety.</li>
        <li>**Choose Low-ABV:** Opt for lower-strength beers, or wines (e.g., 4% ABV beer vs. 7% beer; 11% wine vs. 14% wine).</li>
        <li>**Avoid Rounds:** Drinking in rounds encourages faster and heavier consumption. Order drinks at your own pace.</li>
        <li>**Pre-Eat Protein:** Never drink on an empty stomach. Eating a protein-rich meal beforehand can temper the hunger response and slow alcohol absorption.</li>
    </ul>

    <div className="text-sm italic text-center mt-8 pt-4 border-t border-gray-200">
        <p>This guide is based on established nutritional data and public health recommendations from the National Institute on Alcohol Abuse and Alcoholism (NIAAA), the CDC, and the NHS, highlighting the critical link between alcohol energy and weight management.</p>
    </div>
</section>
    </div>
  );
}
