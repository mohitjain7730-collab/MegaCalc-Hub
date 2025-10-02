
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
import { Ruler } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  waist: z.number().positive(),
  height: z.number().positive(),
  unit: z.enum(['cm', 'in']),
});

type FormValues = z.infer<typeof formSchema>;

const getWhtrCategory = (whtr: number) => {
  if (whtr < 0.5) return { name: 'Healthy', color: 'text-green-500' };
  return { name: 'Increased Risk', color: 'text-red-500' };
};

export default function WaistToHeightRatioCalculator() {
  const [result, setResult] = useState<{ whtr: number; category: { name: string; color: string } } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'cm',
    },
  });

  const onSubmit = (values: FormValues) => {
    const whtr = values.waist / values.height;
    setResult({ whtr, category: getWhtrCategory(whtr) });
  };
  
  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Units</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="cm">cm</SelectItem><SelectItem value="in">inches</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="waist" render={({ field }) => (<FormItem><FormLabel>Waist ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="height" render={({ field }) => (<FormItem><FormLabel>Height ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Ruler className="h-8 w-8 text-primary" /><CardTitle>Waist-to-Height Ratio (WHtR)</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.whtr.toFixed(2)}</p>
                    <p className={`text-2xl font-semibold ${result.category.color}`}>{result.category.name}</p>
                </div>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator divides your waist circumference by your height. The general guideline is that your waist should be less than half your height. A ratio of 0.5 or higher suggests increased risk for health conditions related to central obesity.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="health-risks">
            <AccordionTrigger>Health Risks & Mitigation</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Understanding the Risks</h4>
                    <p>A high Waist-to-Height Ratio (0.5 or greater) is a strong indicator of central obesity. This means excess fat is stored around your abdomen, surrounding vital organs. This type of fat is metabolically active and increases the risk for:</p>
                     <ul className="list-disc list-inside space-y-1 pl-4 mt-2">
                        <li>Cardiovascular diseases</li>
                        <li>Type 2 diabetes</li>
                        <li>High blood pressure (hypertension)</li>
                        <li>Metabolic syndrome</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">How to Improve Your Ratio</h4>
                    <p>Improving your WHtR involves reducing abdominal fat through a combination of diet, exercise, and lifestyle changes. Always consult a healthcare professional before starting a new health regimen.</p>
                    <ul className="list-disc list-inside space-y-1 pl-4 mt-2">
                        <li><strong>Balanced Diet:</strong> Focus on whole foods, lean proteins, fruits, and vegetables. Reduce intake of processed foods, sugary drinks, and unhealthy fats.</li>
                        <li><strong>Consistent Exercise:</strong> Combine cardiovascular exercise (like running, cycling, swimming) with strength training to build muscle and boost your metabolism.</li>
                        <li><strong>Manage Stress:</strong> Chronic stress can increase cortisol levels, which is linked to abdominal fat storage.</li>
                        <li><strong>Prioritize Sleep:</strong> Aim for 7-9 hours of quality sleep, as poor sleep affects appetite-regulating hormones.</li>
                    </ul>
                </div>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

    
