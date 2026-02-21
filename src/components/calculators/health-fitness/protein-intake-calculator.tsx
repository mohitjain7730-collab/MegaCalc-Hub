'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, BarChart3, HelpCircle, Utensils, CheckCircle2, AlertTriangle, Users, BookOpen } from 'lucide-react';
import ProteinIntakeCalculatorInteractive from './protein-intake-calculator-interactive';

export default function ProteinIntakeCalculator() {
  return (
    <div className="space-y-8">
      {/* SEO-Optimized Header */}
      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold">Protein Intake Calculator</h1>
        <p className="text-lg text-muted-foreground">
          Find your optimal daily protein target to build muscle, lose fat, or maintain health. Based on scientific guidelines for your body weight and activity level.
        </p>
      </div>

      <ProteinIntakeCalculatorInteractive />

      {/* Understanding the Inputs */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
          <CardDescription>
            Why body weight and goals matter for protein needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg border">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-primary">
                <Utensils className="h-4 w-4" />
                Body Weight Significance
              </h4>
              <p className="text-sm text-muted-foreground">
                Protein requirements scale with body mass. Larger bodies generally have more muscle mass to support and repair, necessitating higher absolute protein intake.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg border">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-primary">
                <BarChart3 className="h-4 w-4" />
                Goal-Specific Multipliers
              </h4>
              <p className="text-sm text-muted-foreground">
                Your activity dictates the multiplier (g/kg). Sedentary people need ~0.8g/kg for maintenance, while athletes may need up to 2.2g/kg to repair tissue damage from training.
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
                  Calculate your TDEE to ensure you're eating enough calories to support your protein goals.
                </p>
              </Link>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <Link href="/health-fitness/macro-ratio-calculator" className="flex flex-col h-full">
                <h4 className="font-semibold mb-2 text-primary">Macro Ratio Calculator</h4>
                <p className="text-sm text-muted-foreground">
                  See how your protein intake fits into your overall macronutrient distribution.
                </p>
              </Link>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <Link href="/health-fitness/carbohydrate-intake-calculator" className="flex flex-col h-full">
                <h4 className="font-semibold mb-2 text-primary">Carbohydrate Intake Calculator</h4>
                <p className="text-sm text-muted-foreground">
                  Calculate your optimal daily carbohydrate intake to fuel your workouts alongside adequate protein.
                </p>
              </Link>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <Link href="/health-fitness/fat-intake-calculator" className="flex flex-col h-full">
                <h4 className="font-semibold mb-2 text-primary">Fat Intake Calculator</h4>
                <p className="text-sm text-muted-foreground">
                  Determine your daily fat requirements to complete your macronutrient planning.
                </p>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide Section */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg border" itemScope itemType="https://schema.org/Article">
        {/* SEO & SCHEMA METADATA */}
        <meta itemProp="name" content="The Ultimate Guide to Protein Intake: How Much Do You Really Need?" />
        <meta itemProp="description" content="A comprehensive guide to daily protein requirements for muscle gain, fat loss, and longevity. Learn about protein timing, sources, and safety." />
        <meta itemProp="author" content="MegaCalc Health Team" />
        <meta itemProp="datePublished" content="2026-02-14" />

        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">How Much Protein Do You Need Per Day?</h2>
        <p className="text-lg italic text-muted-foreground">Discover the science-backed protein targets that optimize muscle growth, recovery, and satiety.</p>

        <h3 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h3>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#quick-summary" className="hover:underline">Quick Science Summary</a></li>
          <li><a href="#goals" className="hover:underline">Protein for Different Goals</a></li>
          <li><a href="#quality" className="hover:underline">Protein Quality & Digestibility</a></li>
          <li><a href="#timing" className="hover:underline">Meal Timing & Distribution</a></li>
          <li><a href="#safety" className="hover:underline">Safety & Myths</a></li>
        </ul>
        <hr className="my-6" />

        <h3 id="quick-summary" className="font-bold text-xl text-foreground mt-6">1) Quick Science Summary</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Protein supplies essential amino acids your body cannot make. They are the raw materials for muscle, enzymes, hormones, skin, hair, and immune proteins.</li>
          <li>Daily needs depend primarily on <strong>body mass</strong>, <strong>training status</strong>, <strong>goal</strong> (gain, maintain, or cut), and total energy intake.</li>
          <li>For most healthy adults: <strong>1.6–2.2 g/kg</strong> bodyweight (≈ <strong>0.7–1.0 g/lb</strong>) covers muscle gain and retention; endurance athletes often do well at <strong>1.2–1.6 g/kg</strong>; general health is typically met by <strong>0.8–1.2 g/kg</strong>.</li>
          <li>Distribute protein across <strong>3–5 meals</strong> per day, with <strong>25–40 g</strong> per meal (or ~<strong>0.4–0.6 g/kg</strong>) to hit the leucine threshold and maximize muscle protein synthesis.</li>
          <li>Higher protein intakes increase <strong>satiety</strong> and the <strong>thermic effect of food</strong>, which can help with appetite control during fat loss.</li>
        </ul>

        <h3 id="goals" className="font-bold text-xl text-foreground mt-6">2) Protein for Different Goals</h3>
        <h4 className="font-semibold text-foreground mt-2">Muscle Gain / Strength</h4>
        <p>
          Combine progressive resistance training with <strong>1.6–2.2 g/kg</strong> protein and a modest calorie surplus (e.g., 5–15%). Spread protein over
          3–5 feedings, include a protein‑rich meal within 1–3 hours around training, and consider a slow‑digesting source (e.g., casein)
          before sleep if daily protein is hard to meet in fewer meals.
        </p>
        <h4 className="font-semibold text-foreground mt-2">Fat Loss / Cutting</h4>
        <p>
          Higher protein helps mitigate muscle loss during energy restriction. Many athletes benefit from <strong>1.8–2.4 g/kg</strong> when in a calorie deficit.
          Emphasize lean sources (white fish, poultry breast, low‑fat dairy, legumes with complementary grains) and high‑fiber carbs and
          vegetables for fullness. Hydration and sodium/potassium are crucial while dieting, especially if carbohydrate intake fluctuates.
        </p>
        <h4 className="font-semibold text-foreground mt-2">Endurance Training</h4>
        <p>
          Endurance athletes need protein for repair and remodeling. <strong>1.2–1.6 g/kg</strong> often works well, with additional emphasis on total energy
          and carbohydrate to fuel volume. A <strong>20–35 g</strong> protein serving in the post‑training meal supports recovery.
        </p>

        <h3 id="quality" className="font-bold text-xl text-foreground mt-6">3) Protein Quality & Digestibility</h3>
        <p>
          Protein quality is about <strong>amino acid profile</strong> and <strong>digestibility</strong>. Animal proteins generally score higher, but well‑planned plant‑based diets can reach the same outcomes.
        </p>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>High‑quality animal proteins:</strong> dairy (whey, casein, Greek yogurt), eggs, lean meats, fish.</li>
          <li><strong>High‑quality plant proteins:</strong> soy (tofu, tempeh, edamame), pea, mixed‑grain and legume blends; aim for variety.</li>
          <li><strong>Leucine threshold:</strong> ~2–3 g leucine per meal helps maximally stimulate muscle protein synthesis. Whey is leucine‑rich; plant blends can match with slightly larger servings.</li>
        </ul>

        <h3 id="timing" className="font-bold text-xl text-foreground mt-6">4) Meal Timing and Distribution</h3>
        <p>
          Total daily protein is the primary driver of results, but <strong>distribution</strong> and <strong>timing</strong> fine‑tune outcomes.
        </p>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>3–5 meals/day</strong> with <strong>25–40 g</strong> each.</li>
          <li><strong>Pre/post‑workout window:</strong> a protein‑rich meal 1–3 h before or after training supports remodeling and recovery.</li>
          <li><strong>Before bed (optional):</strong> 30–40 g slow‑digesting protein (e.g., casein or Greek yogurt) if you struggle to hit daily totals.</li>
        </ul>

        <h3 id="safety" className="font-bold text-xl text-foreground mt-6">5) Safety, Kidneys, and Common Myths</h3>
        <p>
          In healthy individuals, higher‑protein diets are considered safe. Research does not show harm to kidney function in healthy adults at common athletic intakes. If you have <strong>pre‑existing kidney disease</strong>, consult a healthcare professional.
        </p>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Myth:</strong> "Excess protein turns to fat." Reality: calories beyond needs drive fat gain; protein is actually very satiating.</li>
          <li><strong>Myth:</strong> "You can only absorb 30 g per meal." Reality: muscle protein synthesis may plateau around 30-40g, but your body absorbs and uses the rest for other functions.</li>
        </ul>

        <p className="italic mt-6 border-t pt-4">
          Educational use only. This guide is not a substitute for individualized medical advice. If you live with chronic conditions or have specific dietary needs, work with a qualified healthcare professional or registered dietitian.
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
            Common questions about protein intake
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I eat more than the recommended range?</h4>
              <p className="text-muted-foreground">
                You can, but diminishing returns set in. Consuming &gt;2.5g/kg usually offers no additional muscle-building benefit and simply adds calories.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Do I need protein powder?</h4>
              <p className="text-muted-foreground">
                No, supplements are just convenience tools. You can meet all your needs through whole foods like chicken, fish, eggs, dairy, beans, and tofu.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What if I'm a vegetarian/vegan?</h4>
              <p className="text-muted-foreground">
                You can absolutely build muscle. Since plant proteins are slightly less bioavailable, aim for the higher end of the range (e.g., 2.0g/kg instead of 1.6g/kg) and eat a variety of sources.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Does protein harm kidneys?</h4>
              <p className="text-muted-foreground">
                Not in healthy individuals. Decades of research show high-protein diets are safe for healthy kidneys. Only those with pre-existing kidney disease need to restrict protein.
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
                <strong className="block text-primary mb-1">Strength Athletes</strong>
                <span className="text-sm text-muted-foreground">To maximize hypertrophy and recovery between sessions.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border">
                <strong className="block text-primary mb-1">Older Adults (65+)</strong>
                <span className="text-sm text-muted-foreground">To combat sarcopenia (muscle loss) and maintain functional independence.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border">
                <strong className="block text-primary mb-1">Vegans & Vegetarians</strong>
                <span className="text-sm text-muted-foreground">To ensure adequate intake despite lower bioavailability of plant sources.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border">
                <strong className="block text-primary mb-1">Weight Loss Dieters</strong>
                <span className="text-sm text-muted-foreground">To suppress appetite and preserve metabolic rate while dieting.</span>
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
                <span><strong>Estimation Only:</strong> These are guidelines based on averages. Your unique metabolism may require slightly more or less.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Training Volume:</strong> If you are training twice a day, you may need to be at the very top of (or slightly exceed) the range.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Body Composition:</strong> For individuals with very high body fat (obese), calculating based on total weight may overestimate needs. It is often better to use <strong>Lean Body Mass</strong> or goal weight.</span>
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
                The Protein Intake Calculator estimates your daily protein needs in grams based on your body weight and activity goal.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Protein is the building block of life, essential for repairing tissues, making enzymes, and building muscle.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Use this tool to find your target range, then aim to hit that target consistently through a combination of high-quality whole foods and supplements if necessary.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
