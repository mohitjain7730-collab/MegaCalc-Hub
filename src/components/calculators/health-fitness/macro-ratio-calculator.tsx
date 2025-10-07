
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart as PieChartIcon } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Slider } from '@/components/ui/slider';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const formSchema = z.object({
  tdee: z.number().positive(),
  proteinPercent: z.number().min(0).max(100),
  carbPercent: z.number().min(0).max(100),
  fatPercent: z.number().min(0).max(100),
}).refine(data => Math.abs(data.proteinPercent + data.carbPercent + data.fatPercent - 100) < 1, {
    message: "Percentages must add up to 100.",
    path: ["fatPercent"],
});

type FormValues = z.infer<typeof formSchema>;

interface Result {
    protein: number;
    carbs: number;
    fat: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

export default function MacroRatioCalculator() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        tdee: undefined,
        proteinPercent: 30,
        carbPercent: 40,
        fatPercent: 30,
    },
  });

  const onSubmit = (values: FormValues) => {
    const proteinGrams = (values.tdee * (values.proteinPercent / 100)) / 4;
    const carbGrams = (values.tdee * (values.carbPercent / 100)) / 4;
    const fatGrams = (values.tdee * (values.fatPercent / 100)) / 9;
    setResult({ protein: proteinGrams, carbs: carbGrams, fat: fatGrams });
  };
  
  const protein = form.watch('proteinPercent');
  const carbs = form.watch('carbPercent');
  const fat = form.watch('fatPercent');

  const chartData = result ? [
    { name: 'Protein (30%)', value: result.protein },
    { name: 'Carbs (40%)', value: result.carbs },
    { name: 'Fat (30%)', value: result.fat },
  ] : [];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="tdee"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>Total Daily Calories (TDEE)</FormLabel>
                  <Link href="/category/health-fitness/daily-calorie-needs-calculator" className="text-xs text-primary underline">
                    (Calculate)
                  </Link>
                </div>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="space-y-6">
            <FormField control={form.control} name="proteinPercent" render={({ field }) => (
                <FormItem>
                    <FormLabel>Protein: {protein}%</FormLabel>
                    <FormControl><Slider defaultValue={[30]} min={0} max={100} step={5} onValueChange={(vals) => field.onChange(vals[0])} /></FormControl>
                </FormItem>
            )} />
             <FormField control={form.control} name="carbPercent" render={({ field }) => (
                <FormItem>
                    <FormLabel>Carbohydrates: {carbs}%</FormLabel>
                    <FormControl><Slider defaultValue={[40]} min={0} max={100} step={5} onValueChange={(vals) => field.onChange(vals[0])} /></FormControl>
                </FormItem>
            )} />
            <FormField control={form.control} name="fatPercent" render={({ field }) => (
                <FormItem>
                    <FormLabel>Fat: {fat}%</FormLabel>
                    <FormControl><Slider defaultValue={[30]} min={0} max={100} step={5} onValueChange={(vals) => field.onChange(vals[0])} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Macros</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><PieChartIcon className="h-8 w-8 text-primary" /><CardTitle>Your Daily Macronutrient Goals</CardTitle></div></CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                        <div>
                            <p className="text-muted-foreground">Protein</p>
                            <p className="text-2xl font-bold">{result.protein.toFixed(0)}g</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Carbohydrates</p>
                            <p className="text-2xl font-bold">{result.carbs.toFixed(0)}g</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Fat</p>
                            <p className="text-2xl font-bold">{result.fat.toFixed(0)}g</p>
                        </div>
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={chartData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `${value.toFixed(0)}g`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                </div>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator divides your total daily calories into grams for each macronutrient. It uses the standard caloric values: 4 calories per gram of protein, 4 calories per gram of carbohydrate, and 9 calories per gram of fat. Based on your desired percentages, it calculates the target gram amount for each macro to meet your daily calorie goal.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
