'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, BarChart3, HelpCircle, Utensils, CheckCircle2, AlertTriangle, Users, BookOpen } from 'lucide-react';
import CarbohydrateIntakeCalculatorInteractive from './carbohydrate-intake-calculator-interactive';

export default function CarbohydrateIntakeCalculator() {
  return (
    <div className="space-y-8">
      {/* SEO-Optimized Header */}
      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold">Carbohydrate Intake Calculator</h1>
        <p className="text-lg text-muted-foreground">
          Determine your daily carbohydrate needs to fuel your workouts, maximize recovery, and maintain high energy levels. Perfect for runners, cyclists, and strength athletes.
        </p>
      </div>

      <CarbohydrateIntakeCalculatorInteractive />

      {/* Understanding the Inputs */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
          <CardDescription>
            Why training volume dictates your fuel needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg border">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-primary">
                <Utensils className="h-4 w-4" />
                Body Weight Logic
              </h4>
              <p className="text-sm text-muted-foreground">
                Carbohydrate needs are calculated based on body weight because larger individuals require more fuel to support their higher basal metabolic rate and energy expenditure during movement.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg border">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-primary">
                <BarChart3 className="h-4 w-4" />
                Activity Levels
              </h4>
              <p className="text-sm text-muted-foreground">
                The more you move, the more glycogen (stored carbs) you burn. Sedentary people need just enough for brain function (2-3g/kg), while endurance athletes need massive amounts (8-10g/kg) to prevent "hitting the wall."
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Related Nutrition Calculators
          </CardTitle>
          <CardDescription>
            Explore other tools to complete your diet planning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <Link href="/health-fitness/daily-calorie-needs-calculator" className="flex flex-col h-full">
                <h4 className="font-semibold mb-2 text-primary">Daily Calorie Needs Calculator</h4>
                <p className="text-sm text-muted-foreground">
                  Calculate your TDEE to ensure you're eating enough total energy.
                </p>
              </Link>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <Link href="/health-fitness/protein-intake-calculator" className="flex flex-col h-full">
                <h4 className="font-semibold mb-2 text-primary">Protein Intake Calculator</h4>
                <p className="text-sm text-muted-foreground">
                  Determine your optimal protein intake to balance with your carbohydrate needs.
                </p>
              </Link>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <Link href="/health-fitness/macro-ratio-calculator" className="flex flex-col h-full">
                <h4 className="font-semibold mb-2 text-primary">Macro Ratio Calculator</h4>
                <p className="text-sm text-muted-foreground">
                  See how your carb intake fits into your overall macronutrient distribution.
                </p>
              </Link>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <Link href="/health-fitness/fat-intake-calculator" className="flex flex-col h-full">
                <h4 className="font-semibold mb-2 text-primary">Fat Intake Calculator</h4>
                <p className="text-sm text-muted-foreground">
                  Calculate your daily fat requirements to complete your macronutrient planning.
                </p>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide Section */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg border" itemScope itemType="https://schema.org/Article">
        {/* SEO & SCHEMA METADATA */}
        <meta itemProp="name" content="The Ultimate Carbohydrate Guide: How Many Carbs Should You Eat Daily?" />
        <meta itemProp="description" content="Calculate your daily carb needs for running, lifting, and general health. Learn about carb timing, glycemic index, and fiber." />
        <meta itemProp="author" content="MegaCalc Health Team" />
        <meta itemProp="datePublished" content="2026-02-14" />

        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">How Many Carbs Do You Need Per Day?</h2>
        <p className="text-lg italic text-muted-foreground">Use science-backed guidelines to match your fuel intake with your training intensity.</p>

        <h3 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h3>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#ranges" className="hover:underline">Carb Ranges by Training Volume</a></li>
          <li><a href="#periodization" className="hover:underline">Carb Cycling & Periodization</a></li>
          <li><a href="#quality" className="hover:underline">Fiber, GI, and GL</a></li>
          <li><a href="#examples" className="hover:underline">Practical Meal Ideas</a></li>
          <li><a href="#basics" className="hover:underline">Why Carbs Are Important</a></li>
        </ul>
        <hr className="my-6" />

        <h3 id="ranges" className="font-bold text-xl text-foreground mt-6">1) Carb Ranges by Training Volume (g/kg)</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Low intensity / sedentary:</strong> ~2–3 g/kg supports general health and light movement.</li>
          <li><strong>Moderate training (~1 h/day):</strong> ~3–5 g/kg for most gym‑goers and recreational athletes.</li>
          <li><strong>High volume (1–3 h/day):</strong> ~5–7 g/kg for team sports, CrossFit® or hybrid endurance.</li>
          <li><strong>Very high (4–5+ h/day):</strong> ~8–10 g/kg short‑term for camps, stage races, or peak blocks.</li>
        </ul>

        <h3 id="periodization" className="font-bold text-xl text-foreground mt-6">2) Carb Periodization (Fuel for the Work Required)</h3>
        <p>Match carb intake to training demand. Use <strong>high‑carb days</strong> for long/quality sessions and <strong>lower‑carb days</strong> for easy/recovery.</p>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Pre‑workout (1–3 h):</strong> 1–3 g/kg depending on session length/intensity.</li>
          <li><strong>During (≥90 min):</strong> 30–60 g/hour (up to 90 g with mixed glucose:fructose).</li>
          <li><strong>Post:</strong> 1.0–1.2 g/kg in the first 1–2 h to accelerate glycogen resynthesis when training again within 24 h.</li>
        </ul>

        <h3 id="quality" className="font-bold text-xl text-foreground mt-6">3) Fiber, GI, and GL</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Fiber:</strong> Aim for ~14 g per 1,000 kcal (≈ 25–38 g/day). Increase gradually and hydrate.</li>
          <li><strong>Glycemic Index (GI):</strong> rate of rise in blood glucose. <strong>Glycemic Load (GL)</strong> = GI × carbs per serving ÷ 100 (better for real meals).</li>
          <li>Choose <strong>whole, minimally processed</strong> carbs for most meals; use <strong>faster carbs</strong> around high‑intensity training.</li>
        </ul>

        <h3 id="examples" className="font-bold text-xl text-foreground mt-6">4) Practical Meal Ideas (per ~30–60 g carbs)</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Oats + banana + milk/yogurt</li>
          <li>Rice + beans + salsa; or quinoa bowl with chickpeas</li>
          <li>2 slices whole‑grain bread + turkey + fruit</li>
          <li>Potatoes/sweet potatoes + lean protein + salad</li>
        </ul>

        <h3 id="basics" className="font-bold text-xl text-foreground mt-6">5) Why Carbohydrates Are Important</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Performance:</strong> Adequate carbs sustain pace and power output by preserving muscle glycogen.</li>
          <li><strong>Recovery:</strong> Carbs + protein after training replenish glycogen and support muscle repair.</li>
          <li><strong>Brain function:</strong> The brain prefers glucose; low carb availability can feel like brain fog for some.</li>
          <li><strong>Hormones:</strong> Chronically low energy/carbs can disrupt sex hormones and thyroid in susceptible individuals.</li>
        </ul>

        <p className="italic mt-6 border-t pt-4">
          Educational use only. Not a substitute for medical advice.
        </p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about carbohydrate intake
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Do carbs make you gain fat?</h4>
              <p className="text-muted-foreground">
                No, carbs themselves don't cause fat gain—a sustained calorie surplus does. Carbs fuel high-intensity training, which burns more calories.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I eat carbs before or after workouts?</h4>
              <p className="text-muted-foreground">
                Both. Pre-workout carbs provide energy to lift heavier and run faster. Post-workout carbs replenish glycogen to jumpstart recovery.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What is the difference between simple and complex carbs?</h4>
              <p className="text-muted-foreground">
                Simple carbs (fruits, sugars) digest fast suitable for workout fuel. Complex carbs (grains, beans, veggies) digest slow and provide sustained energy throughout the day.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I eat carbs at night?</h4>
              <p className="text-muted-foreground">
                Yes. Total daily intake matters more than timing. For some, evening carbs can actually improve sleep quality by increasing serotonin.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage of this Calculator */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Usage of this Calculator
          </CardTitle>
          <CardDescription>
            Practical applications and real-world context
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Who should use */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Users className="h-5 w-5 text-primary" />
              Who Should Use This Calculator?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg border">
                <strong className="block text-primary mb-1">Endurance Athletes</strong>
                <span className="text-sm text-muted-foreground">To calculate how much to eat for marathon training or long cycling rides.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border">
                <strong className="block text-primary mb-1">CrossFit / HIIT</strong>
                <span className="text-sm text-muted-foreground">To fuel high-intensity anaerobic efforts that exclusively burn carbohydrates.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border">
                <strong className="block text-primary mb-1">Hardgainers</strong>
                <span className="text-sm text-muted-foreground">To ensure a caloric surplus by tracking carb intake alongside protein.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border">
                <strong className="block text-primary mb-1">General Fitness</strong>
                <span className="text-sm text-muted-foreground">To find a balanced baseline for daily energy needs.</span>
              </div>
            </div>
          </div>

          <hr className="border-border/50" />

          {/* Limitations */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Limitations & Accuracy Nuances
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Insulin Sensitivity:</strong> Some people handle carbs better than others. If you feel sleepy after a high-carb meal, you may need slightly less.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Fiber Content:</strong> The calculator gives total carbs. Aim for ~30g of fiber within that total for gut health.</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Info className="h-6 w-6 text-primary mt-1 shrink-0" />
            <div>
              <h2 className="font-semibold text-lg mb-2">Summary</h2>
              <p className="text-sm text-muted-foreground">
                The Carbohydrate Intake Calculator provides a daily gram target to fuel your specific activity level.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Carbohydrates are the body's preferred fuel source for high-intensity exercise and brain function.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Adjust your intake based on your training schedule: eat more on hard training days and less on rest days to optimize body composition and performance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
