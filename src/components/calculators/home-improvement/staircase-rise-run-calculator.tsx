
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
import { Calculator } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


const formSchema = z.object({
  totalRise: z.number().positive(),
  idealRiserHeight: z.number().positive().optional(),
  unit: z.enum(['inches', 'cm']),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
    steps: number;
    riserHeight: number;
    treadDepth: number;
    totalRun: number;
    chartData: { name: string; value: number }[];
}

export default function StaircaseRiseRunCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'inches',
      totalRise: undefined,
      idealRiserHeight: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { totalRise, unit } = values;
    const isImperial = unit === 'inches';
    const defaultIdealRiser = isImperial ? 7.5 : 19; // Default ideal riser height in inches or cm
    const idealRiser = values.idealRiserHeight || defaultIdealRiser;

    const numberOfRisers = Math.round(totalRise / idealRiser);
    const actualRiserHeight = totalRise / numberOfRisers;
    
    // Rule: 2 x Riser Height + Tread Depth = 24 to 25 inches (or 61-63.5 cm)
    const idealTreadDepth = (isImperial ? 24.5 : 62) - (2 * actualRiserHeight);
    
    const totalRun = idealTreadDepth * (numberOfRisers - 1);

    const chartData = [
        { name: 'Riser Height', value: parseFloat(actualRiserHeight.toFixed(2)) },
        { name: 'Tread Depth', value: parseFloat(idealTreadDepth.toFixed(2)) },
    ];

    setResult({ steps: numberOfRisers, riserHeight: actualRiserHeight, treadDepth: idealTreadDepth, totalRun, chartData });
  };

  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem><FormLabel>Units</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="inches">Inches</SelectItem><SelectItem value="cm">Centimeters</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="totalRise" render={({ field }) => (
                <FormItem><FormLabel>Total Rise (floor to floor)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="idealRiserHeight" render={({ field }) => (
                <FormItem className="md:col-span-2">
                    <FormLabel>Ideal Riser Height (Optional)</FormLabel>
                    <FormControl><Input type="number" placeholder={`e.g., ${unit === 'inches' ? '7.5' : '19'}`} {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl>
                    <CardDescription className='text-xs'>Leave blank to use a standard comfortable height.</CardDescription>
                    <FormMessage />
                </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Calculator className="h-8 w-8 text-primary" /><CardTitle>Staircase Dimensions</CardTitle></div></CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <ul className="list-disc pl-5 text-lg space-y-2">
                            <li><strong>Number of Steps (Risers):</strong> {result.steps}</li>
                            <li><strong>Riser Height:</strong> {result.riserHeight.toFixed(2)} {unit}</li>
                            <li><strong>Tread Depth:</strong> {result.treadDepth.toFixed(2)} {unit}</li>
                            <li><strong>Total Run (horizontal distance):</strong> {result.totalRun.toFixed(2)} {unit}</li>
                        </ul>
                        <CardDescription className='mt-4'>Check local building codes. These are standard calculations but codes can vary.</CardDescription>
                    </div>
                    <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={result.chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis allowDecimals={false} unit={unit} />
                                <Tooltip formatter={(value: number) => `${value.toFixed(2)} ${unit}`} />
                                <Bar dataKey="value" fill="hsl(var(--primary))" name="Dimension" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <ol className="list-decimal list-inside space-y-1">
                    <li><strong>Number of Risers:</strong> Divides the `Total Rise` by your `Ideal Riser Height` (or a standard comfortable height if left blank) to get an approximate number of steps, then rounds to the nearest whole number.</li>
                    <li><strong>Actual Riser Height:</strong> Recalculates the exact riser height by dividing the `Total Rise` by the whole number of steps. This ensures every step is identical.</li>
                    <li><strong>Tread Depth:</strong> Uses a common building rule (`2 x Riser Height + Tread Depth ≈ 24.5 inches`) to calculate a comfortable and safe tread depth based on the riser height.</li>
                    <li><strong>Total Run:</strong> Calculates the total horizontal space the staircase will occupy by multiplying the tread depth by the number of treads (which is always one less than the number of risers).</li>
                </ol>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="stair-rules">
          <AccordionTrigger>Common Stair Building Rules</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4">
            <p>While you should always check local building codes, here are some widely accepted rules of thumb for comfortable and safe stairs:</p>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>7/11 Rule:</strong> A common rule suggests a riser height of around 7 inches and a tread depth of around 11 inches.</li>
                <li><strong>18-Inch Rule:</strong> The sum of the riser height and the tread depth should be approximately 18 inches (45 cm).</li>
                <li><strong>2R + T Rule:</strong> The sum of twice the riser height plus the tread depth should be between 24 and 25 inches (61-63.5 cm). This calculator uses this rule.</li>
                <li><strong>Consistency is Key:</strong> The most critical rule is that all riser heights and all tread depths on a flight of stairs must be consistent. Variations of more than 3/8 inch (1 cm) can be a serious tripping hazard.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
