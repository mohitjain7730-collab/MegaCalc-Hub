
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
import { Flame } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Flame className="h-8 w-8 text-primary" /><CardTitle>Your TDEE Result</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.tdee.toFixed(0)}</p>
                    <CardDescription>Estimated calories/day to maintain your current weight.</CardDescription>
                </div>
                <div className="mt-8">
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
       <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-2">How It Works</h3>
        <div className="text-muted-foreground">
            <p>This calculator uses the Mifflin-St Jeor equation to estimate your Basal Metabolic Rate (BMR), which is the calories your body burns at rest. It then multiplies your BMR by an activity multiplier to estimate your Total Daily Energy Expenditure (TDEE).</p>
            <p className="font-mono p-2 bg-muted rounded-md text-sm mt-2">TDEE = BMR × Activity Multiplier</p>
        </div>
      </div>
      <div className="space-y-4 prose prose-sm dark:prose-invert max-w-none">
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
            <li>Click “Calculate.” Instantly see your daily calorie needs.</li>
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
        <p>Let’s calculate for a 30-year-old woman, height 165 cm, weight 60 kg, moderately active:</p>
        <p>BMR = (10×60) + (6.25×165) - (5×30) - 161 = 600 + 1031.25 - 150 - 161 = 1320 kcal/day</p>
        <p>TDEE = 1320 × 1.55 = 2046 kcal/day</p>
        <p>➡️ She needs ~2050 calories/day to maintain her weight.</p>
        <p>If she wants to lose 0.5 kg per week: 2050 - 500 = 1550 calories/day</p>
        
        <h4 className='font-bold text-lg mt-4'>🌍 Regional Relevance: India, US, UK & Beyond</h4>
        <p>Calorie needs don’t change by country — but diet types and lifestyle patterns do. In India, many people have carb-rich diets (rice, chapati). A balanced mix of protein and fiber is essential for calorie control. In the US & UK, processed foods are common, so focusing on portion control and nutrient density helps. For office workers worldwide, light activity levels mean you should calculate conservatively to avoid overeating.</p>
        
        <h4 className='font-bold text-lg mt-4'>🧾 FAQ: Common Questions About Daily Calorie Needs</h4>
        <ol className="list-decimal list-inside pl-4">
            <li><strong>How do I calculate my calorie needs manually?</strong><br/>Use the Mifflin-St Jeor formula above and multiply by your activity factor.</li>
            <li><strong>Do calorie needs change daily?</strong><br/>Slightly — depending on your physical activity and sleep.</li>
            <li><strong>How often should I recalculate?</strong><br/>Every time your weight changes by 3–5 kg or your activity pattern changes.</li>
            <li><strong>Is eating below BMR safe?</strong><br/>No. Always eat at least your BMR to keep your body functioning properly.</li>
            <li><strong>Does metabolism slow with age?</strong><br/>Yes. Regular strength training helps maintain muscle and burn more calories.</li>
        </ol>
        
        <h4 className='font-bold text-lg mt-4'>🏁 Conclusion</h4>
        <p>A Daily Calorie Needs Calculator is your first step toward effective weight management and healthier living. By knowing your TDEE and adjusting your calorie intake, you can reach your fitness goals — whether it’s losing weight, gaining muscle, or maintaining a healthy lifestyle.</p>
        <p>Use the calculator daily, track your meals, and adjust your intake over time. Small, consistent efforts lead to sustainable results.</p>
      </div>
    </div>
  );
}
