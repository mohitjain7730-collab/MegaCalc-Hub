'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets, Info, Target, BarChart3, HelpCircle } from 'lucide-react';
import Link from 'next/link';

// Data from Water Footprint Network (waterfootprint.org), global averages in liters/kg
const foodWaterFootprints = {
  beef: { name: 'Beef', value: 15415, green: 0.94, blue: 0.04, grey: 0.02 },
  pork: { name: 'Pork', value: 5988, green: 0.90, blue: 0.07, grey: 0.03 },
  chicken: { name: 'Chicken', value: 4325, green: 0.82, blue: 0.12, grey: 0.06 },
  rice: { name: 'Rice', value: 2497, green: 0.45, blue: 0.48, grey: 0.07 },
  wheat: { name: 'Wheat Bread', value: 1608, green: 0.70, blue: 0.19, grey: 0.11 },
  soybeans: { name: 'Soybeans', value: 2145, green: 0.97, blue: 0.01, grey: 0.02 },
  potatoes: { name: 'Potatoes', value: 287, green: 0.55, blue: 0.23, grey: 0.22 },
  lettuce: { name: 'Lettuce', value: 237, green: 0.57, blue: 0.29, grey: 0.14 },
  tomatoes: { name: 'Tomatoes', value: 214, green: 0.35, blue: 0.50, grey: 0.15 },
  milk: { name: 'Milk', value: 1020, green: 0.85, blue: 0.08, grey: 0.07 },
  cheese: { name: 'Cheese', value: 5060, green: 0.85, blue: 0.08, grey: 0.07 },
  eggs: { name: 'Eggs', value: 3265, green: 0.83, blue: 0.11, grey: 0.06 },
};

const formSchema = z.object({
  food: z.string().min(1),
  quantity: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;
type Result = {
    total: number;
    green: number;
    blue: number;
    grey: number;
};

export default function WaterFootprintOfFoodCalculator() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      food: 'beef',
      quantity: 1,
    },
  });

  const onSubmit = (values: FormValues) => {
    const foodData = foodWaterFootprints[values.food as keyof typeof foodWaterFootprints];
    const total = foodData.value * values.quantity;
    setResult({
        total,
        green: total * foodData.green,
        blue: total * foodData.blue,
        grey: total * foodData.grey,
    });
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Calculate Water Footprint of Food
          </CardTitle>
          <CardDescription>
            Discover how much water is required to produce different foods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="food" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Food Item</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                            {Object.entries(foodWaterFootprints).map(([key, data]) => (
                                <SelectItem key={key} value={key}>{data.name}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                )} />
                <FormField control={form.control} name="quantity" render={({ field }) => (
                    <FormItem><FormLabel>Quantity (kg)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <Button type="submit">Calculate Footprint</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {result && (
        <Card>
            <CardHeader>
              <div className='flex items-center gap-4'>
                <Droplets className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Estimated Water Footprint</CardTitle>
                  <CardDescription>Water required for food production</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
                <div className="text-center space-y-2 mb-6">
                    <p className="text-4xl font-bold">{result.total.toLocaleString(undefined, {maximumFractionDigits: 0})} Liters</p>
                    <CardDescription>To produce {form.getValues('quantity')}kg of {foodWaterFootprints[form.getValues('food') as keyof typeof foodWaterFootprints].name}.</CardDescription>
                </div>
                 <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <p className='font-semibold text-green-600 dark:text-green-400'>Green Water</p>
                      <p className="text-lg font-bold">{result.green.toLocaleString(undefined, {maximumFractionDigits: 0})} L</p>
                      <p className="text-xs text-muted-foreground mt-1">Rainwater</p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <p className='font-semibold text-blue-600 dark:text-blue-400'>Blue Water</p>
                      <p className="text-lg font-bold">{result.blue.toLocaleString(undefined, {maximumFractionDigits: 0})} L</p>
                      <p className="text-xs text-muted-foreground mt-1">Irrigation</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-950/20 rounded-lg">
                      <p className='font-semibold text-gray-600 dark:text-gray-400'>Grey Water</p>
                      <p className="text-lg font-bold">{result.grey.toLocaleString(undefined, {maximumFractionDigits: 0})} L</p>
                      <p className="text-xs text-muted-foreground mt-1">Pollution</p>
                    </div>
                </div>
            </CardContent>
        </Card>
      )}

      {/* Educational Content - Expanded Sections */}
      <div className="space-y-6">
        {/* Understanding the Inputs Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Understanding the Inputs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Food Item</h4>
              <p className="text-muted-foreground">
                Select the type of food for which you want to calculate the water footprint. The calculator includes common foods with data from the Water Footprint Network. Different foods require vastly different amounts of water due to factors like growing conditions, processing needs, and feed requirements for animal products.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Quantity (kg)</h4>
              <p className="text-muted-foreground">
                The weight of the food item in kilograms. This determines the total water footprint—larger quantities require more water proportionally. You can calculate for a single serving or larger amounts to understand the impact of your typical consumption patterns.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Understanding Water Types</h4>
              <p className="text-muted-foreground">
                The calculator breaks down the total into three types: Green water (rainwater used for crop growth), Blue water (surface/groundwater used for irrigation), and Grey water (water needed to dilute pollutants). This breakdown helps you understand the sustainability implications—green water is generally more sustainable than blue or grey water, especially in water-scarce regions.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Related Calculators Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Related Calculators
            </CardTitle>
            <CardDescription>
              Explore other nutrition and environmental calculators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/hydration-needs-calculator" className="text-primary hover:underline">
                    Hydration Needs Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate your personal daily water needs for optimal health and performance.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/carbohydrate-intake-calculator" className="text-primary hover:underline">
                    Carbohydrate Intake Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Understand your daily carbohydrate needs while considering the environmental impact of food choices.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/protein-intake-calculator" className="text-primary hover:underline">
                    Protein Intake Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate your protein needs while considering the water footprint of different protein sources.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary hover:underline">
                    Daily Calorie Needs Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Understand your nutritional needs while making environmentally conscious food choices.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5" />
              Complete Guide to Water Footprint of Food
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h2 className="text-xl font-bold text-foreground">What Is the Water Footprint of Food?</h2>
            <p>It's the total volume of freshwater used to produce food, including rainwater (green), irrigation (blue), and water to dilute pollution (grey). Values vary by region, farming method, and yield.</p>

            <h3 className="font-semibold text-foreground mt-6">How to Interpret Results</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Compare similar foods (e.g., beef vs chicken vs legumes) to find lower‑impact swaps.</li>
              <li>Consider nutrition per liter: protein, vitamins, and minerals matter—don't optimize water alone.</li>
              <li>Local conditions can outweigh global averages—water scarcity makes blue water more critical.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">Ways to Reduce Your Dietary Water Footprint</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Shift some animal protein to legumes, soy, eggs, or poultry where appropriate.</li>
              <li>Choose seasonal and local produce to reduce blue/grey water burdens.</li>
              <li>Cut food waste: plan menus, store properly, and use leftovers creatively.</li>
            </ul>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about water footprints and sustainable food choices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Why do animal products have such high water footprints?</h4>
              <p className="text-muted-foreground">
                Animal products require water not just for the animal itself, but also for growing all the feed crops that the animal consumes over its lifetime. For example, producing 1 kg of beef requires approximately 15,000+ liters because cattle eat large amounts of feed (which itself requires water to grow) over several years. This is why plant-based protein sources generally have much lower water footprints.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Are these water footprint values the same everywhere?</h4>
              <p className="text-muted-foreground">
                No. These are global averages. Actual water footprints vary significantly by region, farming practices, climate, and production methods. For example, beef raised on grass in areas with abundant rainfall has a different footprint than feedlot beef in arid regions. The calculator provides useful comparisons, but local conditions matter more for assessing actual environmental impact.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between green, blue, and grey water?</h4>
              <p className="text-muted-foreground">
                Green water is rainwater that falls and is stored in soil for plant growth—it's naturally replenished. Blue water is freshwater withdrawn from rivers, lakes, or aquifers for irrigation—this can deplete water sources. Grey water is the volume of freshwater needed to dilute pollutants to meet water quality standards. Green water is generally most sustainable; blue and grey water are more concerning in water-scarce regions.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I only eat foods with low water footprints?</h4>
              <p className="text-muted-foreground">
                Not necessarily. While considering water footprint is valuable, it's just one factor in sustainable eating. Also consider nutrition, calories, protein content, local availability, and other environmental impacts (carbon, land use). For example, nuts have moderate water footprints but provide excellent nutrition. Balance water footprint with overall nutritional needs and other sustainability factors.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How can I reduce my water footprint without going vegan?</h4>
              <p className="text-muted-foreground">
                You can make significant reductions by: choosing poultry over beef (chicken has roughly 1/3 the water footprint of beef), incorporating more plant-based meals, reducing portion sizes of high-footprint foods, choosing eggs over meat in some meals, and minimizing food waste. Small shifts in consumption patterns can add up to meaningful water savings without completely eliminating animal products.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Does the water footprint include processing and packaging?</h4>
              <p className="text-muted-foreground">
                The values typically include water used in primary production (growing crops or raising animals) and basic processing, but may not fully account for all packaging, transportation, and retail water use. The majority of a food's water footprint usually comes from the production phase rather than processing or packaging, but these factors do add to the total environmental impact.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Is local always better for water footprint?</h4>
              <p className="text-muted-foreground">
                Not always, but often. Local production can reduce transportation-related water use and may be grown in ways suited to local climate conditions. However, sometimes foods grown in ideal climates and shipped can have lower overall footprints than foods grown locally in water-scarce regions using extensive irrigation. The key is understanding both local conditions and production methods.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How accurate are these calculations?</h4>
              <p className="text-muted-foreground">
                The calculations use data from the Water Footprint Network, which is based on extensive research and global averages. They provide reasonable estimates for comparison purposes, but actual values vary significantly by specific production methods, location, and farming practices. Use them as guidance for understanding relative differences between foods rather than absolute values for any specific product.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Does organic farming change water footprints?</h4>
              <p className="text-muted-foreground">
                Organic farming can affect water footprints in different ways. It may reduce grey water (pollution) but could increase blue water (irrigation) needs if yields are lower. However, organic practices often improve soil health, which can increase water retention and reduce irrigation needs. The impact varies by crop, region, and specific practices. The calculator uses conventional farming averages.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How can I use this information in my daily life?</h4>
              <p className="text-muted-foreground">
                Use it to make informed choices: perhaps choose chicken over beef occasionally, incorporate more legumes into meals, prioritize seasonal produce, and reduce food waste (which wastes all the water that went into producing that food). You don't need to be perfect—small, consistent changes add up. Balance sustainability considerations with your nutritional needs, preferences, and budget.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
