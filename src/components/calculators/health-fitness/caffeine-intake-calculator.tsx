
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Coffee, PlusCircle, XCircle, Info } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
                    <FormItem>
                      <FormControl><Input type="number" placeholder="Qty" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl>
                      <p className="text-xs text-muted-foreground">Examples: coffee 1–3, espresso 1–2</p>
                    </FormItem>
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
      {/* Interpretation */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Interpretation</CardTitle>
            <CardDescription>Category, takeaway, and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const pct = result.percent;
              let category = 'Low intake';
              if (pct >= 50 && pct < 100) category = 'Moderate intake';
              if (pct >= 100) category = 'High intake';
              const opinion = pct >= 100 ? 'You are at or above the recommended daily limit—consider reducing to manage sleep and jitters.' : pct >= 50 ? 'You are approaching the recommended daily limit; be mindful late in the day.' : 'Intake appears modest; still avoid late-afternoon caffeine to protect sleep.';
              const recs = [
                'Avoid caffeine within 6–8 hours of bedtime.',
                'Track hidden sources (OTC meds, energy products, chocolate).',
                'If sensitive, taper by ~25% weekly and substitute decaf.'
              ];
              return (
                <div className="space-y-2">
                  <p><span className="font-semibold">Category:</span> {category} ({pct.toFixed(0)}% of 400 mg)</p>
                  <p><span className="font-semibold">Takeaway:</span> {opinion}</p>
                  <ul className="list-disc ml-5 text-sm text-muted-foreground">{recs.map((r,i)=><li key={i}>{r}</li>)}</ul>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coffee className="h-5 w-5" />
            Related Calculators
          </CardTitle>
          <CardDescription>Explore health & intake tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg"><h4 className="font-semibold mb-1"><a href="/category/health-fitness/sugar-intake-calculator" className="text-primary hover:underline">Sugar Intake Calculator</a></h4><p className="text-sm text-muted-foreground">Assess added sugars versus limits.</p></div>
            <div className="p-4 border rounded-lg"><h4 className="font-semibold mb-1"><a href="/category/health-fitness/hydration-needs-calculator" className="text-primary hover:underline">Hydration Needs Calculator</a></h4><p className="text-sm text-muted-foreground">Estimate daily fluid targets.</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Guide (minimal, editable) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Complete Guide to Caffeine Intake
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Use this space for your comprehensive guide on caffeine limits and sources.</p>
          <p>I added placeholders; you can replace them with detailed content later.</p>
        </CardContent>
      </Card>

      {/* FAQ (8-10 items, expanded) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>About caffeine and health</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            ['What is a safe daily caffeine limit?', 'Up to ~400 mg/day for healthy adults; lower for pregnancy and teens.'],
            ['Does caffeine late in the day affect sleep?', 'Yes—avoid within 6–8 hours of bedtime due to its half-life.'],
            ['Do energy drinks have more caffeine than coffee?', 'Often comparable per serving; cans may contain multiple servings.'],
            ['Is decaf caffeine‑free?', 'No—decaf still contains small amounts (typically 2–15 mg/cup).'],
            ['Can caffeine raise heart rate?', 'Yes—sensitivity varies; reduce intake if palpitations occur.'],
            ['Are there hidden sources of caffeine?', 'Yes—OTC meds, supplements, chocolate, and some snacks.'],
            ['How should I taper caffeine?', 'Reduce by ~25% weekly; mix in decaf; hydrate well.'],
            ['Does caffeine dehydrate you?', 'Mildly diuretic, but moderate intake contributes to hydration.'],
            ['Is espresso stronger than brewed coffee?', 'Per ounce yes; total mg depends on serving size.'],
            ['What if I’m very sensitive?', 'Stay well below 400 mg; consider limiting to 100–200 mg/day.'],
          ].map(([q,a],i) => (
            <div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
