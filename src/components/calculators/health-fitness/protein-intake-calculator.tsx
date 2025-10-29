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
import { Utensils, Info, Target, Users, BarChart3, HelpCircle } from 'lucide-react';
import Link from 'next/link';

const goals = {
  sedentary: { min: 0.8, max: 1.2, description: 'Sedentary / Maintenance' },
  muscle: { min: 1.6, max: 2.2, description: 'Muscle Building / Strength' },
  endurance: { min: 1.2, max: 1.6, description: 'Endurance Athlete' },
  fatLoss: { min: 1.6, max: 2.0, description: 'Fat Loss (in a deficit)' },
};

const formSchema = z.object({
  weight: z.number().positive(),
  unit: z.enum(['kg', 'lbs']),
  goal: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ProteinIntakeCalculator() {
  const [result, setResult] = useState<{ min: number; max: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goal: 'muscle',
    },
  });

  const onSubmit = (values: FormValues) => {
    let weightInKg = values.weight;
    if (values.unit === 'lbs') {
      weightInKg *= 0.453592;
    }
    
    const goal = goals[values.goal as keyof typeof goals];
    
    setResult({
        min: weightInKg * goal.min,
        max: weightInKg * goal.max,
    });
  };
  
  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Calculate Your Protein Needs
          </CardTitle>
          <CardDescription>
            Determine your optimal daily protein intake based on your body weight and fitness goals
          </CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="weight" render={({ field }) => (
                <FormItem><FormLabel>Weight ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem><FormLabel>Unit</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="kg">Kilograms (kg)</SelectItem><SelectItem value="lbs">Pounds (lbs)</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="goal" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Primary Goal</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{Object.entries(goals).map(([key, value]) => <SelectItem key={key} value={key}>{value.description}</SelectItem>)}</SelectContent></Select></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
            <CardHeader>
              <div className='flex items-center gap-4'>
                <Utensils className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Recommended Daily Protein Intake</CardTitle>
                  <CardDescription>Personalized range based on your goals</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.min.toFixed(0)} - {result.max.toFixed(0)} g</p>
                    <CardDescription>This is a general guideline. Needs can vary based on individual factors.</CardDescription>
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
              <h4 className="font-semibold text-foreground mb-2">Body Weight</h4>
              <p className="text-muted-foreground">
                Protein needs are primarily based on body weight (and lean body mass). Larger individuals generally need more protein than smaller individuals. You can enter your weight in either kilograms or pounds—the calculator will convert as needed.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Primary Goal</h4>
              <p className="text-muted-foreground">
                Your fitness goal determines your protein needs. Muscle building and fat loss require higher protein intakes (1.6–2.2 g/kg) to support muscle growth or preserve muscle mass during calorie restriction. Endurance athletes need moderate amounts (1.2–1.6 g/kg), while sedentary individuals need less (0.8–1.2 g/kg) for basic health.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Why There's a Range</h4>
              <p className="text-muted-foreground">
                The calculator provides a range rather than a single number because individual protein needs vary based on factors like training intensity, age, total calorie intake, and individual metabolism. Start at the lower end of your range and increase if needed, especially if you're very active or in a calorie deficit.
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
              Explore other nutrition calculators to optimize your diet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary hover:underline">
                    Daily Calorie Needs Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate your total daily energy expenditure to ensure you're eating enough calories to support your protein goals.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/macro-ratio-calculator" className="text-primary hover:underline">
                    Macro Ratio Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  See how your protein intake fits into your overall macronutrient distribution.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/carbohydrate-intake-calculator" className="text-primary hover:underline">
                    Carbohydrate Intake Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate your optimal daily carbohydrate intake to fuel your workouts alongside adequate protein.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/fat-intake-calculator" className="text-primary hover:underline">
                    Fat Intake Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Determine your daily fat requirements to complete your macronutrient planning.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              Complete Guide to Protein Intake
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h2 className="text-xl font-bold text-foreground">How Much Protein Do You Need Per Day?</h2>
            <p>
              If you are asking "how much protein should I eat?", you are not alone. This Protein Intake Calculator gives you a personalized
          daily range in grams using peer‑reviewed position stands and sports nutrition guidelines. Below you will find a comprehensive,
          plain‑language guide that explains the <strong>why</strong> behind the numbers, how to <strong>apply them to real meals</strong>, and how
          to adjust for goals like <strong>muscle building</strong>, <strong>fat loss</strong>, and <strong>endurance performance</strong>.
        </p>

        <h3 className="font-semibold text-foreground mt-6">1) Quick Science Summary</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Protein supplies essential amino acids your body cannot make. They are the raw materials for muscle, enzymes, hormones, skin, hair, and immune proteins.</li>
          <li>Daily needs depend primarily on <strong>body mass</strong>, <strong>training status</strong>, <strong>goal</strong> (gain, maintain, or cut), and total energy intake.</li>
          <li>For most healthy adults: <strong>1.6–2.2 g/kg</strong> bodyweight (≈ <strong>0.7–1.0 g/lb</strong>) covers muscle gain and retention; endurance athletes often do well at <strong>1.2–1.6 g/kg</strong>; general health is typically met by <strong>0.8–1.2 g/kg</strong>.</li>
          <li>Distribute protein across <strong>3–5 meals</strong> per day, with <strong>25–40 g</strong> per meal (or ~<strong>0.4–0.6 g/kg</strong>) to hit the leucine threshold and maximize muscle protein synthesis.</li>
          <li>Higher protein intakes increase <strong>satiety</strong> and the <strong>thermic effect of food</strong>, which can help with appetite control during fat loss.</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">2) Understanding the Calculator Ranges</h3>
        <p>
          The calculator multiplies your body mass by goal‑specific ranges used by sports nutrition organizations. For example, a
          75&nbsp;kg person aiming to build muscle might target <strong>120–165 g/day</strong> (75 × 1.6 to 75 × 2.2). Someone training for endurance might target
          <strong>90–120 g/day</strong> (75 × 1.2 to 75 × 1.6). These are <em>effective</em> ranges rather than single magic numbers—individual appetite,
          digestibility, and total calories all matter.
        </p>

        <h3 className="font-semibold text-foreground mt-6">3) Converting g/kg to g/lb (and vice versa)</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>To go from <strong>g/kg → g/lb</strong>, divide by <strong>2.205</strong>. Example: 1.8 g/kg ≈ 0.82 g/lb.</li>
          <li>To go from <strong>g/lb → g/kg</strong>, multiply by <strong>2.205</strong>. Example: 0.9 g/lb ≈ 2.0 g/kg.</li>
          <li>Fast estimate: <strong>0.7–1.0 g/lb</strong> spans the popular hypertrophy range for most lifters.</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">4) Protein for Different Goals</h3>
        <h4 className="font-semibold text-foreground">Muscle Gain / Strength</h4>
        <p>
          Combine progressive resistance training with <strong>1.6–2.2 g/kg</strong> protein and a modest calorie surplus (e.g., 5–15%). Spread protein over
          3–5 feedings, include a protein‑rich meal within 1–3 hours around training, and consider a slow‑digesting source (e.g., casein)
          before sleep if daily protein is hard to meet in fewer meals.
        </p>
        <h4 className="font-semibold text-foreground">Fat Loss / Cutting</h4>
        <p>
          Higher protein helps mitigate muscle loss during energy restriction. Many athletes benefit from <strong>1.8–2.4 g/kg</strong> when in a calorie deficit.
          Emphasize lean sources (white fish, poultry breast, low‑fat dairy, legumes with complementary grains) and high‑fiber carbs and
          vegetables for fullness. Hydration and sodium/potassium are crucial while dieting, especially if carbohydrate intake fluctuates.
        </p>
        <h4 className="font-semibold text-foreground">Endurance Training</h4>
        <p>
          Endurance athletes need protein for repair and remodeling. <strong>1.2–1.6 g/kg</strong> often works well, with additional emphasis on total energy
          and carbohydrate to fuel volume. A <strong>20–35 g</strong> protein serving in the post‑training meal supports recovery.
        </p>
        <h4 className="font-semibold text-foreground">General Health & Maintenance</h4>
        <p>
          For most adults who are not training intensely, <strong>0.8–1.2 g/kg</strong> supports tissue turnover and normal health. Older adults may benefit from
          the higher end (≥1.0–1.2 g/kg) due to <em>anabolic resistance</em>, where a slightly larger per‑meal dose (e.g., 30–40 g) is helpful.
        </p>

        <h3 className="font-semibold text-foreground mt-6">5) Protein Quality, Digestibility, and Completeness</h3>
        <p>
          Protein quality is about <strong>amino acid profile</strong> and <strong>digestibility</strong>. Measures like <strong>PDCAAS</strong> and the newer <strong>DIAAS</strong> rate how well a
          protein provides essential amino acids. Animal proteins generally score higher, but well‑planned plant‑based diets can reach the same
          outcomes by combining sources across the day.
        </p>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>High‑quality animal proteins:</strong> dairy (whey, casein, Greek yogurt), eggs, lean meats, fish.</li>
          <li><strong>High‑quality plant proteins:</strong> soy (tofu, tempeh, edamame), pea, mixed‑grain and legume blends; aim for variety.</li>
          <li><strong>Leucine threshold:</strong> ~2–3 g leucine per meal helps maximally stimulate muscle protein synthesis. Whey is leucine‑rich; plant blends can match with slightly larger servings.</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">6) Vegetarians & Vegans: Hitting Targets Reliably</h3>
        <p>
          You can build muscle and perform at a high level on a plant‑exclusive diet. Focus on <strong>soy</strong>, <strong>pea</strong>, <strong>lentils</strong>,
          <strong>beans</strong>, <strong>seitan</strong>, <strong>quinoa</strong>, and fortified plant yogurts. Consider a plant protein blend supplement (e.g., pea + rice) to
          simplify hitting per‑meal protein amounts without excessive calories.
        </p>
        <ul className="list-disc ml-6 space-y-1">
          <li>Combine legumes with grains (e.g., beans + rice) across the day for a complete amino profile.</li>
          <li>Augment lower‑leucine meals with an extra 5–10 g protein to reach the leucine threshold.</li>
          <li>Track overall calories—some plant proteins come with more carbs or fats, which can be beneficial or problematic depending on goals.</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">7) Meal Timing and Distribution</h3>
        <p>
          Total daily protein is the primary driver of results, but <strong>distribution</strong> and <strong>timing</strong> fine‑tune outcomes. Practical patterns include:
        </p>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>3–5 meals/day</strong> with <strong>25–40 g</strong> each (or ~0.4–0.6 g/kg per meal).</li>
          <li><strong>Pre/post‑workout window:</strong> a protein‑rich meal 1–3 h before or after training supports remodeling and recovery.</li>
          <li><strong>Before bed (optional):</strong> 30–40 g slow‑digesting protein (e.g., casein or Greek yogurt) if you struggle to hit daily totals.</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">8) Supplements: Whey, Casein, and Plant Blends</h3>
        <p>
          Supplements are <em>convenience</em>—not requirements. <strong>Whey</strong> is rapidly digested and leucine‑rich; <strong>casein</strong> digests slower and
          suits pre‑sleep feedings; <strong>plant blends</strong> (pea + rice, soy isolate) help vegans meet per‑meal targets. Choose third‑party tested products and
              remember that whole foods provide micronutrients and fiber you won't get from powders.
        </p>

        <h3 className="font-semibold text-foreground mt-6">9) Safety, Kidneys, and Common Myths</h3>
        <p>
          In healthy individuals, higher‑protein diets are considered safe. Research does not show harm to kidney function in healthy adults
          at common athletic intakes. If you have <strong>pre‑existing kidney disease</strong>, diabetes with nephropathy, or other medical conditions, consult a
          healthcare professional for individualized guidance.
        </p>
        <ul className="list-disc ml-6 space-y-1">
              <li><strong>Myth:</strong> "Excess protein turns to fat." Reality: calories beyond needs drive fat gain; protein is satiating and has a high thermic effect.</li>
              <li><strong>Myth:</strong> "You can only absorb 30 g per meal." Reality: muscle protein synthesis maxes out around 25–40 g for many, but the rest still supports whole‑body needs.</li>
              <li><strong>Myth:</strong> "Plant proteins can't build muscle." Reality: total protein and leucine intake drive adaptation—well‑planned plant diets work.</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">10) Food Labels, Raw vs Cooked Weights, and Tracking</h3>
        <p>
          Labels list grams of <strong>protein</strong> per serving—not raw grams of the food. Cooking changes water content and weight, but the protein grams remain tied to
          the <em>portion</em>. For accuracy, pick one method (raw or cooked) and be consistent. Example: 100 g raw chicken breast (~31 g protein) typically yields
          ~70–80 g cooked weight with roughly the same 31 g protein.
        </p>
        <ul className="list-disc ml-6 space-y-1">
              <li>Create a personal "protein cheat sheet" with your usual foods and their protein per serving.</li>
          <li>Prioritize lean, high‑protein staples: eggs/whites, poultry breast, lean beef, tuna/salmon, cottage cheese/Greek yogurt, tofu/tempeh, lentils.</li>
          <li>Use mixed dishes (chili, burrito bowls, stir‑fries) to combine protein with fiber‑rich carbs and vegetables.</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">11) Sample Daily Menus (Examples)</h3>
        <p><strong>Example A – 70&nbsp;kg lifter, 1.8 g/kg ≈ 125 g/day:</strong> 4 meals × 30–35 g each + a snack.</p>
        <ul className="list-disc ml-6 space-y-1">
          <li>Breakfast: Greek yogurt bowl (300 g yogurt) + berries + granola (≈ 30 g protein)</li>
          <li>Lunch: Chicken burrito bowl (150 g cooked chicken) with rice, beans, salsa (≈ 40 g)</li>
          <li>Snack: Whey or soy shake (25–30 g) + fruit</li>
          <li>Dinner: Salmon (150 g) + potatoes + salad (≈ 35 g)</li>
        </ul>
        <p><strong>Example B – 80&nbsp;kg vegetarian, 1.6 g/kg ≈ 128 g/day:</strong> 4–5 feedings.</p>
        <ul className="list-disc ml-6 space-y-1">
          <li>Oats + soy milk + soy protein isolate (25–30 g)</li>
          <li>Tofu stir‑fry (200 g tofu) with vegetables + rice (30–35 g)</li>
          <li>Lentil soup (2 cups) + whole‑grain bread (25–30 g)</li>
          <li>Skyr/plant yogurt bowl or pea/rice blend shake (25–30 g)</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">12) Troubleshooting: Why Am I Not Seeing Results?</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Inconsistent training:</strong> progressive overload is the engine; protein fuels the process but cannot replace training.</li>
          <li><strong>Calories too low (or high):</strong> protein is one piece—energy balance determines gain/loss.</li>
          <li><strong>Uneven distribution:</strong> all protein at dinner leaves potential muscle protein synthesis unaddressed earlier in the day.</li>
          <li><strong>Sleep and stress:</strong> aim for 7–9 hours; chronic stress blunts adaptations and appetite regulation.</li>
        </ul>

            <p className="italic mt-6">
              Educational use only. This guide is not a substitute for individualized medical advice. If you live with chronic conditions or have
              specific dietary needs, work with a qualified healthcare professional or registered dietitian.
            </p>
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
              Common questions about protein intake and daily requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I eat more than the upper range of protein?</h4>
              <p className="text-muted-foreground">
                You can, but after your daily target is met (around 1.6–2.2 g/kg for most active people), additional benefits plateau. Extra protein often displaces carbohydrates and fats that you may also need for energy, performance, and overall health. Very high protein intakes (above 3 g/kg) are rarely necessary and can be difficult to sustain.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Do I need protein immediately after training?</h4>
              <p className="text-muted-foreground">
                A protein‑rich meal within a few hours on either side of training works for most people, provided total daily intake is met. The "anabolic window" is wider than previously thought—you have several hours after training to consume protein and still support muscle growth. However, if you train fasted, consuming protein soon after (within 1–2 hours) may be more beneficial.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Is eating protein before bed necessary?</h4>
              <p className="text-muted-foreground">
                Not required, but useful if it helps you hit daily protein targets or supports recovery between early/late training sessions. Slow-digesting proteins like casein (found in cottage cheese or casein powder) can provide a steady supply of amino acids overnight, which may be beneficial for muscle protein synthesis during sleep.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What if I'm pregnant or nursing?</h4>
              <p className="text-muted-foreground">
                Protein needs increase during pregnancy and lactation. The current calculator doesn't account for these special circumstances. Pregnant and breastfeeding women should consult a registered dietitian or healthcare provider for individualized guidance, as protein needs vary by trimester and breastfeeding status.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I get too much protein?</h4>
              <p className="text-muted-foreground">
                For healthy individuals, higher protein intakes (up to 2.5–3.0 g/kg) are generally safe and well-tolerated. However, if you have pre-existing kidney disease, diabetes with nephropathy, or certain metabolic disorders, you should consult a healthcare provider. In healthy people, there's little evidence that high protein intake harms kidneys when adequate hydration is maintained.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between animal and plant protein?</h4>
              <p className="text-muted-foreground">
                Animal proteins are "complete" proteins, meaning they contain all essential amino acids in adequate amounts and are highly bioavailable. Plant proteins are often "incomplete" or lower in certain amino acids, but you can achieve the same results by combining different plant sources (like beans and rice) throughout the day. Plant-based eaters may want to aim for the upper end of protein recommendations to account for lower digestibility.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I know if I'm eating enough protein?</h4>
              <p className="text-muted-foreground">
                Signs you might not be eating enough protein include: slow recovery from workouts, frequent hunger despite eating enough calories, losing muscle mass during weight loss, weak nails/hair, and difficulty building or maintaining muscle. If you're meeting your calculated protein target and still experiencing these issues, consider increasing intake or consulting a nutrition professional.
              </p>
        </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I eat protein at every meal?</h4>
              <p className="text-muted-foreground">
                Distributing protein across 3–5 meals per day (25–40 g per meal) is more effective than eating all your protein in one or two large meals. This helps maximize muscle protein synthesis throughout the day and improves satiety. However, if you prefer fewer meals, focus on hitting your total daily target—meeting the daily total is more important than perfect distribution.
              </p>
        </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Do older adults need more protein?</h4>
              <p className="text-muted-foreground">
                Yes. Older adults (65+) may benefit from higher protein intakes (1.2–1.8 g/kg) due to age-related anabolic resistance, where the body becomes less responsive to protein. This helps preserve muscle mass, which naturally decreases with age (sarcopenia). Higher per-meal doses (30–40 g) may also be more effective for older adults.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I build muscle on a vegetarian or vegan diet?</h4>
              <p className="text-muted-foreground">
                Absolutely. Research shows that well-planned vegetarian and vegan diets can support muscle building just as well as omnivorous diets, provided protein intake is adequate. Focus on high-quality plant proteins like soy, legumes, quinoa, and seitan, and consider combining complementary proteins (like beans and rice) throughout the day. You may want to aim for the upper end of protein recommendations (1.8–2.2 g/kg) to account for lower bioavailability.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
