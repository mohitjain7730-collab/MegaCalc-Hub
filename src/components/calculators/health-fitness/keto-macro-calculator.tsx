
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
import { Utensils } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const activityLevels = {
    sedentary: 1.2,
    lightly: 1.375,
    moderately: 1.55,
    very: 1.725,
    extra: 1.9,
};

const formSchema = z.object({
  age: z.number().int().positive(),
  sex: z.enum(['male', 'female']),
  weight: z.number().positive(),
  height: z.number().positive(),
  activityLevel: z.string(),
  netCarbGoal: z.number().int().min(0).default(25),
  proteinRatio: z.number().min(0.8).max(2.2).default(1.6),
  calorieGoal: z.enum(['maintain', 'deficit', 'surplus']),
});

type FormValues = z.infer<typeof formSchema>;

interface Result {
    netCarbs: number;
    protein: number;
    fat: number;
    totalCalories: number;
}

export default function KetoMacroCalculator() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        activityLevel: '1.375',
        netCarbGoal: undefined,
        proteinRatio: undefined,
        calorieGoal: 'maintain',
    },
  });

  const onSubmit = (values: FormValues) => {
    // 1. Calculate BMR using Mifflin-St Jeor
    let bmr;
    if (values.sex === 'male') {
      bmr = (10 * values.weight) + (6.25 * values.height) - (5 * values.age) + 5;
    } else {
      bmr = (10 * values.weight) + (6.25 * values.height) - (5 * values.age) - 161;
    }
    
    // 2. Calculate TDEE
    const tdee = bmr * parseFloat(values.activityLevel);
    
    // 3. Apply calorie goal
    let targetCalories = tdee;
    if (values.calorieGoal === 'deficit') targetCalories *= 0.8; // 20% deficit
    if (values.calorieGoal === 'surplus') targetCalories *= 1.1; // 10% surplus

    // 4. Estimate Lean Body Mass (LBM) using a simplified formula (Boer)
    let lbm;
    if (values.sex === 'male') {
        lbm = (0.407 * values.weight) + (0.267 * values.height) - 19.2;
    } else {
        lbm = (0.252 * values.weight) + (0.473 * values.height) - 48.3;
    }
    
    // 5. Calculate Macros
    const netCarbs = values.netCarbGoal;
    const protein = lbm * values.proteinRatio;
    const fat = (targetCalories - (netCarbs * 4) - (protein * 4)) / 9;

    setResult({
        netCarbs: Math.round(netCarbs),
        protein: Math.round(protein),
        fat: Math.round(fat),
        totalCalories: Math.round(targetCalories),
    });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="age" render={({ field }) => (<FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="sex" render={({ field }) => (<FormItem><FormLabel>Sex</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent></Select></FormItem>)} />
            <FormField control={form.control} name="weight" render={({ field }) => (<FormItem><FormLabel>Weight (kg)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="height" render={({ field }) => (<FormItem><FormLabel>Height (cm)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="activityLevel" render={({ field }) => (<FormItem><FormLabel>Activity Level</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{Object.entries(activityLevels).map(([key, value]) => <SelectItem key={key} value={String(value)}>{key.charAt(0).toUpperCase() + key.slice(1)}</SelectItem>)}</SelectContent></Select></FormItem>)} />
            <FormField control={form.control} name="calorieGoal" render={({ field }) => (<FormItem><FormLabel>Calorie Goal</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="maintain">Maintain</SelectItem><SelectItem value="deficit">Weight Loss (20% deficit)</SelectItem><SelectItem value="surplus">Weight Gain (10% surplus)</SelectItem></SelectContent></Select></FormItem>)} />
            <FormField control={form.control} name="netCarbGoal" render={({ field }) => (<FormItem><FormLabel>Net Carb Goal (g)</FormLabel><FormControl><Input type="number" placeholder="e.g., 25" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="proteinRatio" render={({ field }) => (<FormItem><FormLabel>Protein Ratio (g/kg LBM)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="e.g., 1.6" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          <Button type="submit">Calculate Keto Macros</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Utensils className="h-8 w-8 text-primary" /><CardTitle>Your Daily Keto Macros</CardTitle></div></CardHeader>
            <CardContent className="text-center">
                <p className="text-muted-foreground">Based on a target of ~{result.totalCalories} calories/day.</p>
                <div className="grid grid-cols-3 gap-4 mt-4">
                    <div><p className="font-bold text-xl">{result.netCarbs}g</p><p>Net Carbs</p></div>
                    <div><p className="font-bold text-xl">{result.protein}g</p><p>Protein</p></div>
                    <div><p className="font-bold text-xl">{result.fat}g</p><p>Fat</p></div>
                </div>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator provides a macronutrient breakdown for a ketogenic diet based on your body composition and goals.</p>
                <ol className="list-decimal list-inside space-y-2">
                  <li><strong>Calorie Target:</strong> It first calculates your maintenance calories (TDEE) and adjusts it based on your goal (maintain, loss, or gain).</li>
                  <li><strong>Lean Body Mass (LBM):</strong> It estimates your LBM using a formula, as protein requirements are best based on lean tissue.</li>
                  <li><strong>Macronutrients:</strong>
                    <ul className="list-disc list-inside ml-4">
                        <li><strong>Carbs:</strong> Set to your specified fixed gram amount to promote ketosis.</li>
                        <li><strong>Protein:</strong> Calculated based on your LBM and protein ratio to preserve muscle mass.</li>
                        <li><strong>Fat:</strong> The remaining calories are allocated to fat, which serves as the primary energy source on a keto diet.</li>
                    </ul>
                  </li>
                </ol>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
