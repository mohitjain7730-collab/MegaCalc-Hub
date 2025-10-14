
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
import Link from 'next/link';
import { EmbedWidget } from '@/components/embed-widget';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


const formSchema = z.object({
  age: z.number().positive().int(),
  gender: z.enum(['male', 'female']),
  weight: z.number().positive(),
  height: z.number().positive(),
  unit: z.enum(['metric', 'imperial']),
});

type FormValues = z.infer<typeof formSchema>;

const activityLevels = [
    { name: 'Sedentary', description: 'Little or no exercise', multiplier: 1.2 },
    { name: 'Lightly Active', description: 'Light exercise (1-3 days/week)', multiplier: 1.375 },
    { name: 'Moderately Active', description: 'Moderate exercise (3-5 days/week)', multiplier: 1.55 },
    { name: 'Very Active', description: 'Hard exercise (6-7 days/week)', multiplier: 1.725 },
    { name: 'Extra Active', description: 'Very hard exercise & physical job', multiplier: 1.9 },
];

export default function BmrCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'metric',
      age: undefined,
      gender: 'male',
      weight: undefined,
      height: undefined,
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
    setResult(bmr);
  };
  
  const unit = form.watch('unit');

  const chartData = result ? activityLevels.map(level => ({
      name: level.name,
      calories: Math.round(result * level.multiplier),
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
          </div>
          <Button type="submit">Calculate BMR</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Flame className="h-8 w-8 text-primary" /><CardTitle>Your BMR Result</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.toFixed(0)}</p>
                    <CardDescription>Calories/day your body burns at rest.</CardDescription>
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
       <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Units, Gender, Age, Weight, Height</h4>
                  <p>These are your basic physical measurements. The Mifflin-St Jeor equation uses gender, age, weight, and height as key variables, as metabolism varies based on these factors.</p>
              </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator uses the Mifflin-St Jeor equation, which is considered one of the most accurate formulas for estimating Basal Metabolic Rate (BMR). BMR is the number of calories your body needs to accomplish its most basic (basal) life-sustaining functions.</p>
                <p>The chart above estimates your Total Daily Energy Expenditure (TDEE) by multiplying your BMR by an activity factor. This gives you an estimate of how many calories you burn per day based on your activity level.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading & Official Sources</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
              <p>For more detailed information on BMR and its role in health, consult these authoritative sources:</p>
               <ul className="list-disc list-inside space-y-1 pl-4">
                  <li><a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4278349/" target="_blank" rel="noopener noreferrer" className="text-primary underline">National Library of Medicine – Mifflin St Jeor Equation</a></li>
              </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
      <section
        className="space-y-4 text-muted-foreground leading-relaxed"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="headline" content="BMR Calculator – Understand Basal Metabolic Rate and Daily Energy Needs" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="What BMR is, how it’s estimated, differences vs TDEE, factors that influence metabolism, and how to use results to plan nutrition." />

        <h2 itemProp="name" className="text-xl font-bold text-foreground">What Is BMR?</h2>
        <p itemProp="description">Basal Metabolic Rate is the energy your body expends at rest to sustain vital functions: breathing, circulation, temperature regulation, and cellular maintenance.</p>

        <h3 className="font-semibold text-foreground mt-6">BMR vs RMR vs TDEE</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>BMR:</strong> strict, lab‑like resting conditions.</li>
          <li><strong>RMR:</strong> resting metabolic rate; similar but measured under less strict conditions—often slightly higher.</li>
          <li><strong>TDEE:</strong> total daily energy expenditure = RMR × activity + non‑exercise movement + thermic effect of food + exercise.</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">What Changes Metabolism?</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Body mass and <strong>lean body mass</strong> (LBM)</li>
          <li>Age, sex, genetics, hormones</li>
          <li>Sleep, stress, medications, and chronic dieting history</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Using Your Result</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Maintenance: calories ≈ TDEE.</li>
          <li>Fat loss: calories below TDEE; preserve protein and resistance training.</li>
          <li>Muscle gain: calories above TDEE with progressive overload.</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
        <div className="space-y-2">
          <p><Link href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary underline">Daily Calorie Needs (TDEE)</Link></p>
          <p><Link href="/category/health-fitness/protein-intake-calculator" className="text-primary underline">Protein Intake Calculator</Link></p>
          <p><Link href="/category/health-fitness/fat-intake-calculator" className="text-primary underline">Fat Intake Calculator</Link></p>
        </div>
      </section>
      
      <EmbedWidget calculatorSlug="bmr-calculator" calculatorName="Basal Metabolic Rate (BMR) Calculator" />
    </div>
  );
}
