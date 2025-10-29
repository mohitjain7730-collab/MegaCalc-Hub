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
import { Flame, Info, Target, Activity, Users, BarChart3, HelpCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const formSchema = z.object({
  age: z.number().positive().int(),
  gender: z.enum(['male', 'female']),
  weight: z.number().positive(),
  height: z.number().positive(),
  unit: z.enum(['metric', 'imperial']),
  activityLevel: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

const activityLevels = [
    { name: 'Sedentary', description: 'Little or no exercise', multiplier: 1.2 },
    { name: 'Lightly Active', description: 'Light exercise (1-3 days/week)', multiplier: 1.375 },
    { name: 'Moderately Active', description: 'Moderate exercise (3-5 days/week)', multiplier: 1.55 },
    { name: 'Very Active', description: 'Hard exercise (6-7 days/week)', multiplier: 1.725 },
    { name: 'Extra Active', description: 'Very hard exercise & physical job', multiplier: 1.9 },
];

export default function DailyCalorieNeedsCalculator() {
  const [result, setResult] = useState<{tdee: number, bmr: number} | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'metric',
      age: undefined,
      gender: 'male',
      weight: undefined,
      height: undefined,
      activityLevel: '1.375',
    },
  });

  const onSubmit = (values: FormValues) => {
    const { age, gender, unit } = values;
    let { weight, height } = values;

    if (unit === 'imperial') {
      weight *= 0.453592; // lbs to kg
      height *= 2.54;     // inches to cm
    }

    let bmr;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    const tdee = bmr * parseFloat(values.activityLevel);

    setResult({tdee, bmr});
  };
  
  const unit = form.watch('unit');

  const chartData = result ? activityLevels.map(level => ({
      name: level.name,
      calories: Math.round(result.bmr * level.multiplier),
      description: level.description,
  })) : [];

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Calculate Your Daily Calorie Needs
          </CardTitle>
          <CardDescription>
            Enter your details to get a personalized estimate of your Total Daily Energy Expenditure (TDEE)
          </CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem><FormLabel>Units</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="metric">Metric (kg, cm)</SelectItem><SelectItem value="imperial">Imperial (lbs, in)</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="gender" render={({ field }) => (
                <FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="age" render={({ field }) => (
                <FormItem><FormLabel>Age (years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="weight" render={({ field }) => (
                <FormItem><FormLabel>Weight ({unit === 'metric' ? 'kg' : 'lbs'})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="height" render={({ field }) => (
                <FormItem><FormLabel>Height ({unit === 'metric' ? 'cm' : 'in'})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="activityLevel" render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                        {activityLevels.map(level => (
                            <SelectItem key={level.name} value={String(level.multiplier)}>{level.name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate TDEE</Button>
        </form>
      </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
            <CardHeader>
              <div className='flex items-center gap-4'>
                <Flame className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Your TDEE Result</CardTitle>
                  <CardDescription>Personalized calorie needs based on your inputs</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
                <div className="text-center space-y-2 mb-8">
                    <p className="text-4xl font-bold">{result.tdee.toFixed(0)}</p>
                    <CardDescription>Estimated calories/day to maintain your current weight.</CardDescription>
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Basal Metabolic Rate (BMR): <span className="font-semibold text-foreground">{result.bmr.toFixed(0)} calories/day</span></p>
                      <p className="text-xs text-muted-foreground mt-1">Your body burns this many calories at rest for basic functions.</p>
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-center mb-4">Daily Calorie Needs by Activity Level</h3>
                     <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} dy={10} />
                                <YAxis />
                                <Tooltip
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-background border p-2 rounded-lg shadow-lg">
                                                    <p className="font-bold">{label}</p>
                                                    <p className='text-sm text-muted-foreground'>{payload[0].payload.description}</p>
                                                    <p className="text-primary mt-1">{`Calories: ${payload[0].value}`}</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="calories" fill="hsl(var(--primary))" name="Estimated Daily Calories" />
                            </BarChart>
                        </ResponsiveContainer>
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
              <h4 className="font-semibold text-foreground mb-2">Age</h4>
              <p className="text-muted-foreground">
                Age affects your metabolism. As you age, your basal metabolic rate naturally decreases, meaning you burn fewer calories at rest. This is why calorie needs typically decrease with age.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Gender</h4>
              <p className="text-muted-foreground">
                Men generally have higher calorie needs than women due to typically having more muscle mass and larger body size. The Mifflin-St Jeor equation uses different constants for men and women to account for these biological differences.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Weight and Height</h4>
              <p className="text-muted-foreground">
                Larger bodies require more energy to function. Weight and height are key factors in calculating your Basal Metabolic Rate (BMR), which is the foundation of your total calorie needs.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Activity Level</h4>
              <p className="text-muted-foreground">
                Your daily activity level determines how much you multiply your BMR to get your TDEE. Choose the level that best matches your typical weekly exercise and daily activity patterns. Be honest—overestimating can lead to eating more than you need.
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
              Explore other nutrition and fitness calculators to optimize your health journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/macro-ratio-calculator" className="text-primary hover:underline">
                    Macro Ratio Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate your optimal protein, carbs, and fat ratios based on your calorie needs.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/protein-intake-calculator" className="text-primary hover:underline">
                    Protein Intake Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Determine how much protein you need daily based on your body weight and fitness goals.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/carbohydrate-intake-calculator" className="text-primary hover:underline">
                    Carbohydrate Intake Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Find your optimal daily carbohydrate intake based on activity level and body weight.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/fat-intake-calculator" className="text-primary hover:underline">
                    Fat Intake Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate your daily fat requirements for optimal health and performance.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/bmr-calculator" className="text-primary hover:underline">
                    BMR Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate your Basal Metabolic Rate - the calories you burn at complete rest.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/body-fat-percentage-calculator" className="text-primary hover:underline">
                    Body Fat Percentage Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Track your body composition and understand your muscle-to-fat ratio.
                </p>
        </div>
      </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5" />
              Complete Guide to Daily Calorie Needs
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
        <h3 className='font-bold text-xl'>🥗 Daily Calorie Needs Calculator: Find Out How Many Calories You Need Per Day</h3>
        <h4 className='font-bold text-lg'>🔍 What Is a Daily Calorie Needs Calculator?</h4>
        <p>A Daily Calorie Needs Calculator helps you determine how many calories your body requires each day to maintain, lose, or gain weight. This calculation is based on your age, gender, height, weight, and activity level. Understanding your calorie needs is essential for creating a healthy diet plan, achieving weight goals, and maintaining overall wellness.</p>
        <p>Whether your goal is fat loss, muscle gain, or simply healthy living, this calculator provides accurate estimates based on scientifically proven formulas like Mifflin-St Jeor or Harris-Benedict equations.</p>
        
        <h4 className='font-bold text-lg mt-4'>⚙️ How the Daily Calorie Needs Calculator Works</h4>
        <p>The calculator estimates your Total Daily Energy Expenditure (TDEE) — the total number of calories you burn per day.</p>
        <p>It uses two major components:</p>
        <ul className="list-disc list-inside pl-4">
            <li>Basal Metabolic Rate (BMR): Calories your body burns at rest to perform basic functions (breathing, blood circulation, etc.).</li>
            <li>Activity Multiplier: Adjusts your BMR based on your lifestyle (sedentary, lightly active, very active, etc.).</li>
        </ul>

        <h4 className='font-bold text-lg mt-4'>🧮 Formula Used for Calculation</h4>
        <p><strong>1. Mifflin-St Jeor Equation (Most Accurate)</strong></p>
        <p>For men:</p>
        <p className="font-mono p-2 bg-muted rounded-md text-sm">BMR=(10×weight in kg)+(6.25×height in cm)−(5×age in years)+5</p>
        <p>For women:</p>
        <p className="font-mono p-2 bg-muted rounded-md text-sm">BMR=(10×weight in kg)+(6.25×height in cm)−(5×age in years)−161</p>
        <p><strong>2. Activity Multiplier</strong></p>
        <p>Multiply your BMR by an activity factor to get your Total Daily Energy Expenditure (TDEE):</p>
        <Table>
            <TableHeader><TableRow><TableHead>Activity Level</TableHead><TableHead>Description</TableHead><TableHead>Multiplier</TableHead></TableRow></TableHeader>
            <TableBody>
                <TableRow><TableCell>Sedentary</TableCell><TableCell>Little or no exercise</TableCell><TableCell>1.2</TableCell></TableRow>
                <TableRow><TableCell>Lightly active</TableCell><TableCell>Light exercise/sports 1-3 days/week</TableCell><TableCell>1.375</TableCell></TableRow>
                <TableRow><TableCell>Moderately active</TableCell><TableCell>Moderate exercise/sports 3-5 days/week</TableCell><TableCell>1.55</TableCell></TableRow>
                <TableRow><TableCell>Very active</TableCell><TableCell>Hard exercise/sports 6-7 days/week</TableCell><TableCell>1.725</TableCell></TableRow>
                <TableRow><TableCell>Extra active</TableCell><TableCell>Very hard exercise & physical job</TableCell><TableCell>1.9</TableCell></TableRow>
            </TableBody>
        </Table>
        <p className="font-mono p-2 bg-muted rounded-md text-sm mt-2">TDEE = BMR × Activity Multiplier</p>
        
        <h4 className='font-bold text-lg mt-4'>🧘‍♀️ How Many Calories Should You Eat Per Day?</h4>
        <p>Once you know your TDEE, you can adjust it based on your goal:</p>
        <Table>
            <TableHeader><TableRow><TableHead>Goal</TableHead><TableHead>Calorie Adjustment</TableHead><TableHead>Result</TableHead></TableRow></TableHeader>
            <TableBody>
                <TableRow><TableCell>Weight Loss</TableCell><TableCell>Subtract 500 kcal/day</TableCell><TableCell>~0.5 kg weight loss per week</TableCell></TableRow>
                <TableRow><TableCell>Weight Gain</TableCell><TableCell>Add 500 kcal/day</TableCell><TableCell>~0.5 kg weight gain per week</TableCell></TableRow>
                <TableRow><TableCell>Maintenance</TableCell><TableCell>Keep calories equal to TDEE</TableCell><TableCell>Weight remains stable</TableCell></TableRow>
            </TableBody>
        </Table>
        <p>Example: If your TDEE = 2,500 calories/day, to lose weight, eat around 2,000 calories/day. To gain weight, eat around 3,000 calories/day.</p>

        <h4 className='font-bold text-lg mt-4'>🍽️ Daily Calorie Needs by Gender and Age</h4>
        <Table>
            <TableHeader><TableRow><TableHead>Age Group</TableHead><TableHead>Men (kcal/day)</TableHead><TableHead>Women (kcal/day)</TableHead></TableRow></TableHeader>
            <TableBody>
                <TableRow><TableCell>18–25</TableCell><TableCell>2,400–3,000</TableCell><TableCell>1,800–2,200</TableCell></TableRow>
                <TableRow><TableCell>26–45</TableCell><TableCell>2,400–2,800</TableCell><TableCell>1,800–2,200</TableCell></TableRow>
                <TableRow><TableCell>46–65</TableCell><TableCell>2,200–2,600</TableCell><TableCell>1,800–2,000</TableCell></TableRow>
                <TableRow><TableCell>65+</TableCell><TableCell>2,000–2,400</TableCell><TableCell>1,600–1,800</TableCell></TableRow>
            </TableBody>
        </Table>
        <p>Note: These are general guidelines — use the calculator for a personalized estimate.</p>
        
        <h4 className='font-bold text-lg mt-4'>🥦 How to Use the Daily Calorie Needs Calculator</h4>
        <ol className="list-decimal list-inside pl-4">
            <li>Enter your gender, age, height, and weight.</li>
            <li>Choose your activity level.</li>
                <li>Click "Calculate." Instantly see your daily calorie needs.</li>
            <li>Adjust your calorie intake based on your goals (gain, lose, or maintain weight).</li>
        </ol>
        
        <h4 className='font-bold text-lg mt-4'>🧡 Why Knowing Your Calorie Needs Matters</h4>
        <ul className="list-disc list-inside pl-4">
            <li>Avoid Overeating: Helps prevent unintentional weight gain.</li>
            <li>Support Fitness Goals: Ideal for people tracking macros or following fitness programs.</li>
            <li>Improve Nutrition: Encourages mindful eating and balanced meal planning.</li>
            <li>Track Progress: Essential for long-term weight management.</li>
        </ul>

        <h4 className='font-bold text-lg mt-4'>🧂 Factors That Affect Your Calorie Needs</h4>
        <ul className="list-disc list-inside pl-4">
            <li>Age: Metabolism slows with age.</li>
            <li>Gender: Men usually burn more calories due to higher muscle mass.</li>
            <li>Body Composition: Muscle burns more calories than fat.</li>
            <li>Activity Level: Physical activity significantly increases daily calorie burn.</li>
            <li>Metabolic Rate: Varies from person to person.</li>
            <li>Hormonal Health: Conditions like thyroid issues affect metabolism.</li>
        </ul>

        <h4 className='font-bold text-lg mt-4'>💪 Tips to Manage Your Calorie Intake Effectively</h4>
        <ul className="list-disc list-inside pl-4">
            <li>Track Your Food: Use apps like MyFitnessPal or Yazio to log meals.</li>
            <li>Choose Whole Foods: Focus on fruits, vegetables, lean protein, and whole grains.</li>
            <li>Avoid Empty Calories: Minimize sugary drinks and junk foods.</li>
            <li>Plan Your Meals: Helps control portion sizes and calorie intake.</li>
            <li>Stay Hydrated: Water supports metabolism and appetite control.</li>
            <li>Combine Diet with Exercise: The best way to balance calorie input and output.</li>
        </ul>
        
        <h4 className='font-bold text-lg mt-4'>📈 Example Calorie Calculation</h4>
            <p>Let's calculate for a 30-year-old woman, height 165 cm, weight 60 kg, moderately active:</p>
        <p>BMR = (10×60) + (6.25×165) - (5×30) - 161 = 600 + 1031.25 - 150 - 161 = 1320 kcal/day</p>
        <p>TDEE = 1320 × 1.55 = 2046 kcal/day</p>
        <p>➡️ She needs ~2050 calories/day to maintain her weight.</p>
        <p>If she wants to lose 0.5 kg per week: 2050 - 500 = 1550 calories/day</p>
        
        <h4 className='font-bold text-lg mt-4'>🌍 Regional Relevance: India, US, UK & Beyond</h4>
            <p>Calorie needs don't change by country — but diet types and lifestyle patterns do. In India, many people have carb-rich diets (rice, chapati). A balanced mix of protein and fiber is essential for calorie control. In the US & UK, processed foods are common, so focusing on portion control and nutrient density helps. For office workers worldwide, light activity levels mean you should calculate conservatively to avoid overeating.</p>
        
        <h4 className='font-bold text-lg mt-4'>🏁 Conclusion</h4>
            <p>A Daily Calorie Needs Calculator is your first step toward effective weight management and healthier living. By knowing your TDEE and adjusting your calorie intake, you can reach your fitness goals — whether it's losing weight, gaining muscle, or maintaining a healthy lifestyle.</p>
        <p>Use the calculator daily, track your meals, and adjust your intake over time. Small, consistent efforts lead to sustainable results.</p>
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
              Common questions about daily calorie needs and TDEE calculation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I calculate my calorie needs manually?</h4>
              <p className="text-muted-foreground">
                Use the Mifflin-St Jeor formula: For men, BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) + 5. For women, subtract 161 instead of adding 5. Then multiply your BMR by your activity factor (1.2 for sedentary, 1.375 for lightly active, 1.55 for moderate, 1.725 for very active, or 1.9 for extra active).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Do calorie needs change daily?</h4>
              <p className="text-muted-foreground">
                Yes, slightly. Your calorie needs can vary day-to-day depending on your physical activity level, amount of sleep, stress levels, and even temperature. However, your baseline TDEE remains relatively stable, and small daily fluctuations usually average out over time.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How often should I recalculate my calorie needs?</h4>
              <p className="text-muted-foreground">
                Recalculate your calorie needs whenever your weight changes by 3-5 kg (7-11 lbs), when your activity pattern significantly changes (e.g., starting a new workout program or changing jobs), or every few months as you age and your metabolism naturally changes.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Is eating below BMR safe?</h4>
              <p className="text-muted-foreground">
                No, eating consistently below your BMR is not recommended for long-term health. Your BMR represents the minimum calories your body needs to perform essential functions like breathing, circulation, and cell production. While short-term calorie deficits can be safe for weight loss, they should typically be 10-25% below your TDEE, not your BMR.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Does metabolism slow with age?</h4>
              <p className="text-muted-foreground">
                Yes, metabolism naturally slows with age, primarily due to loss of muscle mass (sarcopenia) and changes in hormone levels. This is why the formula includes age as a factor. However, regular strength training, staying active, and maintaining muscle mass can help mitigate age-related metabolic decline.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between BMR and TDEE?</h4>
              <p className="text-muted-foreground">
                BMR (Basal Metabolic Rate) is the number of calories your body burns at complete rest—just to maintain basic bodily functions. TDEE (Total Daily Energy Expenditure) includes your BMR plus all calories burned through daily activities, exercise, and the thermic effect of food. TDEE is what you use to determine how many calories to eat.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Why do I need more calories than the calculator suggests?</h4>
              <p className="text-muted-foreground">
                Several factors can cause actual calorie needs to differ from estimates: very high muscle mass, a physically demanding job, high amounts of daily movement (NEAT), genetic factors, or certain medical conditions. Start with the calculated TDEE and adjust based on your results—if you're losing weight when trying to maintain, increase calories; if gaining when trying to lose, decrease them.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I use this calculator if I'm pregnant or breastfeeding?</h4>
              <p className="text-muted-foreground">
                This calculator provides baseline estimates, but pregnancy and breastfeeding significantly increase calorie needs. Pregnant women typically need an additional 300-500 calories in the second and third trimesters, and breastfeeding women need an extra 400-500 calories per day. Always consult with a healthcare provider or registered dietitian for personalized guidance during these periods.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What if my actual weight changes don't match the predicted changes?</h4>
              <p className="text-muted-foreground">
                Weight change predictions assume a consistent 500-calorie deficit or surplus equals about 0.5 kg (1 lb) per week. However, individual results vary due to water retention, muscle gain, hormonal fluctuations, and other factors. If your results differ significantly after 2-4 weeks, adjust your calorie intake by 100-200 calories and monitor for another few weeks.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I use metric or imperial units?</h4>
              <p className="text-muted-foreground">
                Either system works—the calculator converts between them automatically. Use whichever system you're more comfortable with. Just be consistent: if you measure your weight in pounds, also measure your height in inches for accuracy. The calculator will convert everything to metric internally for the formula calculations.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
