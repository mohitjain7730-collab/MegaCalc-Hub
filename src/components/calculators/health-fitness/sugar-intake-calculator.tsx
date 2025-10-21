
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cookie, PlusCircle, XCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const itemSchema = z.object({
  name: z.string().optional(),
  sugar: z.number().nonnegative("Cannot be negative").optional(),
  servings: z.number().int().nonnegative("Servings cannot be negative.").optional(),
});

const formSchema = z.object({
  sex: z.enum(['male', 'female']),
  items: z.array(itemSchema).min(1, "Please add at least one item."),
});

type FormValues = z.infer<typeof formSchema>;

export default function SugarIntakeCalculator() {
  const [result, setResult] = useState<{ total: number; limit: number; percent: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sex: 'female',
      items: [{ name: '', sugar: undefined, servings: undefined }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  const onSubmit = (values: FormValues) => {
    const totalSugar = values.items.reduce((sum, item) => sum + (item.sugar || 0) * (item.servings || 0), 0);
    const limit = values.sex === 'male' ? 36 : 25;
    const percent = limit > 0 ? (totalSugar / limit) * 100 : 0;
    setResult({ total: totalSugar, limit, percent });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="sex" render={({ field }) => (
            <FormItem><FormLabel>Sex</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
              </Select>
            </FormItem>
          )} />

          <Card>
            <CardHeader><CardTitle>Food & Drink Log</CardTitle></CardHeader>
            <CardContent>
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[1fr,100px,80px,auto] gap-2 items-start mb-2">
                  <FormField control={form.control} name={`items.${index}.name`} render={({ field }) => (<FormItem><FormLabel className="sr-only">Product</FormLabel><FormControl><Input placeholder="Product Name" {...field} /></FormControl></FormItem>)} />
                  <FormField control={form.control} name={`items.${index}.sugar`} render={({ field }) => (<FormItem><FormLabel className="sr-only">Sugar</FormLabel><FormControl><Input type="number" placeholder="Sugar (g)" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)}/></FormControl></FormItem>)} />
                  <FormField control={form.control} name={`items.${index}.servings`} render={({ field }) => (<FormItem><FormLabel className="sr-only">Servings</FormLabel><FormControl><Input type="number" placeholder="Servings" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)}/></FormControl></FormItem>)} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><XCircle className="h-5 w-5 text-destructive" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ name: '', sugar: undefined, servings: 1 })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </CardContent>
          </Card>
          <Button type="submit">Calculate Sugar Intake</Button>
        </form>
      </Form>

      {result && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Cookie className="h-8 w-8 text-primary" /><CardTitle>Daily Added Sugar Intake</CardTitle></div></CardHeader>
          <CardContent className="text-center">
            <p className="text-3xl font-bold">{result.total.toFixed(1)}g / {result.limit}g</p>
            <CardDescription className="mt-2">You have consumed {result.percent.toFixed(0)}% of the recommended daily limit.</CardDescription>
            <div className="w-full bg-muted rounded-full h-4 mt-4 overflow-hidden">
                <div className="bg-primary h-4" style={{ width: `${Math.min(100, result.percent)}%` }}></div>
            </div>
          </CardContent>
        </Card>
      )}
      <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
    <meta itemProp="headline" content="Sugar Intake Calculator Guide: Tracking Added Sugars and Meeting AHA/WHO Limits" />
    <meta itemProp="author" content="Your Website/Health Team Name" />
    <meta itemProp="about" content="A comprehensive guide to calculating daily Added Sugar intake in grams and teaspoons, understanding the strict AHA and WHO limits (25g/36g), recognizing hidden sugar names on labels, and mitigating the metabolic risks of excessive sugar consumption." />

    <h1 className="text-2xl font-bold text-foreground mb-4">The Ultimate Sugar Intake Calculator Guide: Finding Your Added Sugar Limit</h1>
    
    <p><em><strong>Disclaimer:</strong> This guide provides educational content based on scientific and public health recommendations (AHA, WHO, FDA). It is not a substitute for professional medical advice. Always consult a healthcare provider or registered dietitian for personalized nutritional planning, especially if you have pre-existing conditions like diabetes.</em></p>

    <h2 className="text-xl font-bold text-foreground mt-8">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-1">
        <li><a href="#intro">The Critical Difference: Added Sugars vs. Natural Sugars</a></li>
        <li><a href="#limits">Official Limits: AHA and WHO Added Sugar Guidelines</a></li>
        <li><a href="#calculator-use">How the Sugar Intake Calculator Quantifies Risk</a></li>
        <li><a href="#hidden">The Label Labyrinth: Identifying Hidden Names for Added Sugar</a></li>
        <li><a href="#metabolic">Metabolic Impact: The Link Between Added Sugar, Fat, and Disease</a></li>
        <li><a href="#sources">Biggest Sources of Added Sugars in the Modern Diet</a></li>
        <li><a href="#strategies">Actionable Strategies to Slash Your Sugar Intake</a></li>
    </ul>

    <h2 id="intro" itemProp="name" className="text-xl font-bold text-foreground mt-8">The Critical Difference: Added Sugars vs. Natural Sugars</h2>
    <p itemProp="description">The goal of tracking sugar intake is not to eliminate all sweetness from your diet, but to drastically reduce **added sugars**. These are the sugars and syrups put into foods during processing, preparation, or added at the table. Unlike sugars found naturally in whole, unprocessed foods, added sugars contribute **zero nutritional benefit** but significant calories that quickly lead to metabolic risk.</p>

    <p>A **Sugar Intake Calculator** is essential because, on average, adults consume two to three times the recommended maximum amount of added sugar daily, primarily from sources we may not recognize as "sweet." Quantifying this intake is the first step in protecting against weight gain, Type 2 diabetes, and cardiovascular disease.</p>

    <h3 className="font-semibold text-foreground mt-6">Natural vs. Added Sugars</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Natural Sugars:** Found in whole fruits (**fructose**) and plain dairy (**lactose**). These are generally healthy because they are packaged with **fiber**, vitamins, and minerals, which slow absorption and promote satiety. These sugars do **not** need to be restricted.</li>
        <li>**Added Sugars:** Includes table sugar, honey, syrups, and fruit juice concentrates. They are digested quickly, causing rapid blood sugar spikes and forcing the body to convert and store the excess energy as fat.</li>
    </ul>

    <h2 id="limits" className="text-xl font-bold text-foreground mt-8">Official Limits: AHA and WHO Added Sugar Guidelines</h2>
    <p>Health organizations recommend strict limits on added sugar consumption, measured in both grams and the equivalent number of teaspoons (1 teaspoon of sugar $\approx$ 4 grams).</p>

    <h3 className="font-semibold text-foreground mt-6">American Heart Association (AHA) Daily Limits (The Strict Standard)</h3>
    <p>The AHA recommends these strict limits to drastically reduce the risk of heart disease and obesity:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Maximum for Women:** **25 grams** (about 6 teaspoons or 100 calories) per day.</li>
        <li>**Maximum for Men:** **36 grams** (about 9 teaspoons or 150 calories) per day.</li>
        <li>**Children (Ages 2–18):** No more than **25 grams** (6 teaspoons) per day.</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">World Health Organization (WHO) Guidelines</h3>
    <p>The WHO recommends limiting **free sugars** (added sugars + sugars in honey, syrups, and fruit juice) to less than **10% of total daily energy intake**. For an average 2,000-calorie diet, this translates to a maximum of **50 grams** (12 teaspoons). The WHO suggests a further reduction to **less than 5%** of energy intake for additional health benefits.</p>

    <h2 id="calculator-use" className="text-xl font-bold text-foreground mt-8">How the Sugar Intake Calculator Quantifies Risk</h2>
    <p>The primary function of the calculator is to track cumulative daily or weekly intake and compare it against the established safe limits, providing context often lost when simply looking at a nutrition label.</p>

    <h3 className="font-semibold text-foreground mt-6">Key Tracker Functions</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Total Grams & Teaspoons:** The calculator converts the gram count (as listed on the label's "Added Sugars" line) into teaspoons, making the volume of sugar consumed more relatable.</li>
        <li>**Percentage of Daily Value (%DV):** Modern calculators use the FDA's 50g daily value reference to show what percentage of the recommended limit a single item consumes (e.g., a drink with 25g of added sugar consumes 50% of the maximum 50g DV).</li>
        <li>**Total Caloric Impact:** The tool reveals the number of "empty calories" contributed by added sugar (4 calories per gram), showing its direct impact on weight gain goals and **TDEE**.</li>
    </ul>
    
    <p>By visually demonstrating that a single 12-ounce can of regular soda can contain over **10 teaspoons (42 grams)** of added sugar—more than the recommended daily limit for most men and nearly double the limit for women—the calculator acts as a powerful motivator for change.</p>

    <h2 id="hidden" className="text-xl font-bold text-foreground mt-8">The Label Labyrinth: Identifying Hidden Names for Added Sugar</h2>
    <p>Food manufacturers often use multiple forms of sugar to prevent "sugar" from being the first ingredient listed. Effective tracking requires vigilance in scanning the entire ingredients list for these hidden names.</p>

    <h3 className="font-semibold text-foreground mt-6">Common Names for Added Sugars</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Syrups:** High-fructose corn syrup, corn syrup, malt syrup, rice syrup, maple syrup, agave nectar.</li>
        <li>**Sugars Ending in "Ose":** Dextrose, Fructose, Glucose, Lactose, Maltose, Sucrose.</li>
        <li>**Concentrates:** Fruit juice concentrates, evaporated cane juice.</li>
        <li>**Other:** Molasses, honey, raw sugar, brown sugar, turbinado sugar.</li>
    </ul>
    <p>***Pro-Tip: Look for the specific "Added Sugars" line on the Nutrition Facts panel first. If that panel is unavailable, check the ingredients list.***</p>

    <h2 id="metabolic" className="text-xl font-bold text-foreground mt-8">Metabolic Impact: The Link Between Added Sugar, Fat, and Disease</h2>
    <p>Excessive added sugar consumption is not just a problem of excess calories; it actively disrupts metabolic health, often leading to visceral fat accumulation in the liver, similar to the effects of alcohol.</p>

    <h3 className="font-semibold text-foreground mt-6">The Cycle of Insulin Resistance and Fat Storage</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Rapid Spike:** Added sugars, especially liquid forms, are absorbed rapidly, causing a sharp spike in blood glucose.</li>
        <li>**Insulin Overload:** The pancreas releases large amounts of insulin to clear this glucose. Chronic high sugar intake dulls the body's response, leading to **insulin resistance**.</li>
        <li>**Fatty Liver:** Excess glucose that the body cannot immediately use is preferentially shunted to the liver and converted into fat (**lipogenesis**). This process contributes to **Non-Alcoholic Fatty Liver Disease (NAFLD)**.</li>
        <li>**Chronic Inflammation:** High sugar intake promotes systemic inflammation in the heart and blood vessels, accelerating damage and contributing to **high blood pressure** and high cholesterol, thus raising **ASCVD** risk.</li>
    </ul>

    <h2 id="sources" className="text-xl font-bold text-foreground mt-8">Biggest Sources of Added Sugars in the Modern Diet</h2>
    <p>Tracking must focus on the major culprits, which are often processed, low-nutrient foods and drinks.</p>
    
    <h3 className="font-semibold text-foreground mt-6">Top Sources to Track and Reduce</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Sugar-Sweetened Beverages (The #1 Source):** Soft drinks, fruit drinks (not 100% juice), sports drinks, and sweetened coffee/tea.</li>
        <li>**Desserts and Baked Goods:** Cookies, cakes, pies, and pastries.</li>
        <li>**Sweetened Dairy:** Flavored yogurts, ice cream, and chocolate milk (which contain added sugar *in addition* to natural lactose).</li>
        <li>**Cereals and Cereal Bars:** Many breakfast cereals and granola bars are marketed as healthy but contain high amounts of added sugars.</li>
    </ul>

    <h2 id="strategies" className="text-xl font-bold text-foreground mt-8">Actionable Strategies to Slash Your Sugar Intake</h2>
    <p>By using the Sugar Intake Calculator, you can identify high-risk foods and implement targeted swaps to meet the strict AHA/WHO guidelines.</p>

    <h3 className="font-semibold text-foreground mt-6">Smart Swaps for a Lower-Sugar Diet</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Rethink Your Drink:** Swap all sugary beverages for water, sparkling water, or unsweetened tea/coffee. Flavor water with slices of fresh fruit (lemon, cucumber, berries).</li>
        <li>**Sweeten Naturally:** Instead of buying sweetened oatmeal or yogurt, buy **plain** versions and sweeten them with your own fresh fruit, cinnamon, or vanilla extract.</li>
        <li>**Cook at Home:** Preparing meals from scratch gives you full control over every ingredient and eliminates hidden sugars common in sauces, dressings, and processed ingredients.</li>
        <li>**Baking Adjustments:** When baking at home, try reducing the sugar called for in the recipe by one-third; your taste buds will quickly adjust to less sweetness.</li>
        <li>**Read Labels:** Aim to buy products with **5 grams of added sugars or less per serving** to keep your intake easily within the recommended daily limits.</li>
    </ul>

    <div className="text-sm italic text-center mt-8 pt-4 border-t border-gray-200">
        <p>This guide references established nutritional guidelines and research from the American Heart Association (AHA), the World Health Organization (WHO), and the U.S. Food and Drug Administration (FDA) on managing added sugar intake.</p>
    </div>
</section>
    </div>
  );
}
