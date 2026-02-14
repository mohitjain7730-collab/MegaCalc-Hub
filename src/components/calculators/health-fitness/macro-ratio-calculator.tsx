'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, BarChart3, HelpCircle, Utensils, CheckCircle2, AlertTriangle, Users, BookOpen } from 'lucide-react';
import MacroRatioCalculatorInteractive from './macro-ratio-calculator-interactive';

export default function MacroRatioCalculator() {
  return (
    <div className="space-y-8">
      {/* SEO-Optimized Header */}
      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold">Macro Ratio Calculator</h1>
        <p className="text-lg text-muted-foreground">
          Optimize your diet with the Macro Ratio Calculator. Determine the perfect protein, carbohydrate, and fat breakdown for muscle gain, fat loss, or maintenance based on your TDEE.
        </p>
      </div>

      <MacroRatioCalculatorInteractive />

      {/* Understanding the Inputs */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
          <CardDescription>
            Key components required for calculating your macronutrient needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg border">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-primary">
                <Utensils className="h-4 w-4" />
                Total Daily Calories (TDEE)
              </h4>
              <p className="text-sm text-muted-foreground">
                Your TDEE (Total Daily Energy Expenditure) is your total daily calorie needs. This forms the basis for calculating how many grams of each macronutrient you should consume.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg border">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-primary">
                <BarChart3 className="h-4 w-4" />
                Macro Percentages
              </h4>
              <p className="text-sm text-muted-foreground">
                The percentage allocation for Protein (4 kcal/g), Carbs (4 kcal/g), and Fat (9 kcal/g). These MUST add up to 100% to ensure all your daily calories are accounted for.
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
              <Link href="/category/health-fitness/daily-calorie-needs-calculator" className="flex flex-col h-full">
                <h4 className="font-semibold mb-2 text-primary">Daily Calorie Needs Calculator</h4>
                <p className="text-sm text-muted-foreground">
                  Calculate your TDEE to know your starting point for macro planning.
                </p>
              </Link>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <Link href="/category/health-fitness/protein-intake-calculator" className="flex flex-col h-full">
                <h4 className="font-semibold mb-2 text-primary">Protein Intake Calculator</h4>
                <p className="text-sm text-muted-foreground">
                  Determine your optimal daily protein intake based on body weight.
                </p>
              </Link>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <Link href="/category/health-fitness/carbohydrate-intake-calculator" className="flex flex-col h-full">
                <h4 className="font-semibold mb-2 text-primary">Carbohydrate Intake Calculator</h4>
                <p className="text-sm text-muted-foreground">
                  Find your ideal daily carbohydrate intake based on activity level.
                </p>
              </Link>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <Link href="/category/health-fitness/fat-intake-calculator" className="flex flex-col h-full">
                <h4 className="font-semibold mb-2 text-primary">Fat Intake Calculator</h4>
                <p className="text-sm text-muted-foreground">
                  Calculate your daily fat requirements for optimal health.
                </p>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide Section */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg border" itemScope itemType="https://schema.org/Article">
        {/* SEO & SCHEMA METADATA */}
        <meta itemProp="name" content="Macro Ratio Calculator — Find the Best Carb / Protein / Fat Split for Your Goals" />
        <meta itemProp="description" content="A comprehensive guide to macronutrient ratios for weight loss, muscle gain, and performance. Learn how to calculate and track your macros effectively." />
        <meta itemProp="author" content="MegaCalc Health Team" />
        <meta itemProp="datePublished" content="2026-02-14" />

        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Macro Ratio Calculator: The Complete Guide to Flexible Dieting</h2>
        <p className="text-lg italic text-muted-foreground">Master the art of macronutrient tracking to reach your body composition goals faster and more sustainably.</p>

        <h3 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h3>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-are-macros" className="hover:underline">What are Macronutrients?</a></li>
          <li><a href="#how-it-works" className="hover:underline">How the Calculator Works</a></li>
          <li><a href="#recommended-ratios" className="hover:underline">Recommended Ratios by Goal</a></li>
          <li><a href="#tracking-tips" className="hover:underline">Practical Tracking Tips</a></li>
        </ul>
        <hr className="my-6" />

        <h3 id="what-are-macros" className='font-bold text-xl text-foreground mt-8'>🔍 What are Macros (Macronutrients)?</h3>
        <p>Macronutrients are the three major nutrients that supply energy (calories):</p>
        <ul className="list-disc list-inside pl-4 mt-2 mb-4 space-y-2">
          <li><strong>Carbohydrates (4 kcal/g):</strong> Primary fuel for high-intensity activity and brain function. Found in grains, fruits, vegetables, and sugars.</li>
          <li><strong>Protein (4 kcal/g):</strong> Essential for muscle repair, immune function, and satiety. Found in meat, dairy, eggs, legumes, and soy.</li>
          <li><strong>Fat (9 kcal/g):</strong> Important for hormone production, vitamin absorption, and long-term energy. Found in oils, nuts, seeds, avocados, and animal fats.</li>
        </ul>
        <p>A <strong>macro ratio</strong> describes the percentage of your total daily calories that comes from each macronutrient (e.g., 40% carbs / 30% protein / 30% fat).</p>

        <h3 id="how-it-works" className='font-bold text-xl text-foreground mt-8'>⚙️ How the Macro Ratio Calculator Works (Formulas)</h3>
        <p>1. Start with daily calories — typically your TDEE (Total Daily Energy Expenditure).<br />2. Choose a macro split — a percentage allocation for carbs/protein/fat (must total 100%).<br />3. Convert percentages to grams using these formulas:</p>

        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-sm font-mono">
          <p className="mb-2"><strong>Carbs (g)</strong> = (TotalCalories × CarbPercent) / 400</p>
          <p className="mb-2"><strong>Protein (g)</strong> = (TotalCalories × ProteinPercent) / 400</p>
          <p><strong>Fat (g)</strong> = (TotalCalories × FatPercent) / 900</p>
        </div>

        <p><em>Example: TDEE = 2,400 kcal, Split = 40C / 30P / 30F</em></p>
        <ul className="list-disc list-inside pl-4 mt-2 mb-4">
          <li>Carbs: 2,400 × 0.40 = 960 kcal → 960 / 4 = 240 g</li>
          <li>Protein: 2,400 × 0.30 = 720 kcal → 720 / 4 = 180 g</li>
          <li>Fat: 2,400 × 0.30 = 720 kcal → 720 / 9 = 80 g</li>
        </ul>

        <h3 id="recommended-ratios" className='font-bold text-xl text-foreground mt-8'>🎯 Recommended Macro Ratios by Goal</h3>
        <p>Different goals benefit from different macro priorities:</p>

        <h4 className='font-bold text-lg mt-4 text-foreground'>1. Fat Loss (Preserve muscle; manage hunger)</h4>
        <ul className="list-disc list-inside pl-4 mt-2">
          <li><strong>Balanced:</strong> 30% Protein / 35% Carbs / 35% Fat</li>
          <li><strong>High Protein:</strong> 35% Protein / 35% Carbs / 30% Fat</li>
        </ul>
        <p className="mt-2 text-sm">Key: High protein helps preserve lean mass in a deficit.</p>

        <h4 className='font-bold text-lg mt-4 text-foreground'>2. Muscle Gain (Lean bulk)</h4>
        <ul className="list-disc list-inside pl-4 mt-2">
          <li><strong>Standard Bulk:</strong> 25-30% Protein / 45-55% Carbs / 20-30% Fat</li>
        </ul>
        <p className="mt-2 text-sm">Key: Sufficient carbs fuel intense training sessions.</p>

        <h4 className='font-bold text-lg mt-4 text-foreground'>3. Maintenance / Recomposition</h4>
        <ul className="list-disc list-inside pl-4 mt-2">
          <li><strong>Balanced:</strong> 30% Protein / 40% Carbs / 30% Fat</li>
        </ul>

        <h4 className='font-bold text-lg mt-4 text-foreground'>4. Keto / Low Carb</h4>
        <ul className="list-disc list-inside pl-4 mt-2">
          <li><strong>Keto:</strong> 20-25% Protein / 5-10% Carbs / 65-75% Fat</li>
        </ul>

        <h3 id="tracking-tips" className='font-bold text-xl text-foreground mt-8'>📝 Tracking Tips & Tools</h3>
        <ul className="list-disc list-inside pl-4 mt-2 mb-4 space-y-2">
          <li><strong>Use an App:</strong> MyFitnessPal, Cronometer, or LoseIt make tracking easy.</li>
          <li><strong>Weigh Your Food:</strong> Using a food scale provides the most accurate data.</li>
          <li><strong>Plan Ahead:</strong> Meal prepping helps ensure you hit your macro targets consistently.</li>
          <li><strong>Adjust Gradually:</strong> If you stop seeing results, tweak your calories or macros slightly (e.g., reduce carbs by 20g).</li>
          <li><strong>Focus on Quality:</strong> Don't just hit the numbers with junk food (IIFYM). Micronutrients and fiber matter for health.</li>
        </ul>

        <h3 className='font-bold text-xl text-foreground mt-8'>🚫 Common Mistakes</h3>
        <ul className="list-disc list-inside pl-4 mt-2 space-y-2">
          <li><strong>Obsessing over exact numbers:</strong> Aim for +/- 5-10g consistency rather than perfection.</li>
          <li><strong>Ignoring Protein:</strong> Undereating protein can lead to muscle loss, especially when dieting.</li>
          <li><strong>Setting Unrealistic Goals:</strong> Don't pick a ratio you hate eating. Adherence is key.</li>
        </ul>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about macro ratios and macronutrient tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I use percentages or grams for macros?</h4>
              <p className="text-muted-foreground">
                Percentages are useful for setting ratios initially, but <strong>grams</strong> are what you actually track day-to-day. Grams are more precise because they don't fluctuate based on your total calorie intake for that specific day.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How often should I recalculate my macros?</h4>
              <p className="text-muted-foreground">
                Recalculate when your weight changes significantly (about 3–5% of body weight), when your activity level changes, or when you switch goals (e.g., from fat loss to muscle gain).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I switch macro splits weekly?</h4>
              <p className="text-muted-foreground">
                Yes, carb cycling involves switching splits (e.g., high carb on training days, low carb on rest days). This is an advanced strategy to optimize performance and body composition.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What if my calculated protein is very high?</h4>
              <p className="text-muted-foreground">
                If the percentage method gives you &gt;2.5g protein per kg of bodyweight, it's likely unnecessary. You can cap protein at 2.2g/kg and reallocate the extra calories to carbs or fats.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What is the most important macro?</h4>
              <p className="text-muted-foreground">
                For body composition, <strong>Protein</strong> is widely considered the most critical macro to hit consistently. Total Calories is the most important factor for weight change.
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
                <strong className="block text-primary mb-1">Bodybuilders & Lifters</strong>
                <span className="text-sm text-muted-foreground">To ensure sufficient protein for muscle repair and carbs for training intensity.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border">
                <strong className="block text-primary mb-1">Fat Loss Seekers</strong>
                <span className="text-sm text-muted-foreground">To optimize satiety and muscle retention while in a calorie deficit.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border">
                <strong className="block text-primary mb-1">Endurance Athletes</strong>
                <span className="text-sm text-muted-foreground">To calculate high-carb needs for fueling long runs or rides.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border">
                <strong className="block text-primary mb-1">Keto/Low-Carb Dieters</strong>
                <span className="text-sm text-muted-foreground">To set precise fat and carb limits to maintain ketosis.</span>
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
                <span><strong>Individual Variation:</strong> Some people feel better on higher fats, others on higher carbs. Experimentation is key.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Medical Conditions:</strong> Diabetics or those with kidney issues should consult a doctor before setting high-carb or high-protein macros.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Food Labels:</strong> FDA allows up to 20% error margin on nutrition labels, so tracking is an estimate, not a perfect science.</span>
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
                The Macro Ratio Calculator helps you partition your daily energy expenditure into specific grams of Protein, Carbohydrates, and Fats.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                By adjusting these ratios, you can tailor your nutrition plan to support specific goals like muscle hypertrophy, rapid fat loss, or endurance performance.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Remember that <strong>Consistency</strong> and <strong>Total Calories</strong> are generally more important than hitting exact macro numbers every single day.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
