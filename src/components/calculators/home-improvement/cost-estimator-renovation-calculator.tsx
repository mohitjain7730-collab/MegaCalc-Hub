
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

const renovationCosts = {
  basicKitchen: 150,
  midKitchen: 250,
  highKitchen: 400,
  basicBathroom: 200,
  midBathroom: 350,
  highBathroom: 500,
  basement: 50,
};

const formSchema = z.object({
  area: z.number().positive(),
  renovationType: z.nativeEnum(renovationCosts),
  unit: z.enum(['feet', 'meters']),
});

type FormValues = z.infer<typeof formSchema>;

export default function CostEstimatorRenovationCalculator() {
  const [result, setResult] = useState<{ low: number; high: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'feet',
      renovationType: renovationCosts.basicKitchen,
      area: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    let { area, renovationType, unit } = values;

    if (unit === 'meters') {
        area *= 10.7639; // to sq ft
    }
    
    const baseCost = area * renovationType;
    setResult({ low: baseCost * 0.8, high: baseCost * 1.2 });
  };

  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem><FormLabel>Units</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="feet">Square Feet</SelectItem><SelectItem value="meters">Square Meters</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="renovationType" render={({ field }) => (
                <FormItem><FormLabel>Renovation Type</FormLabel><Select onValueChange={(v) => field.onChange(parseFloat(v))} defaultValue={String(field.value)}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>
                    {Object.entries(renovationCosts).map(([key, value]) => (<SelectItem key={key} value={String(value)}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</SelectItem>))}
                </SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="area" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Area ({unit === 'feet' ? 'sq ft' : 'sq m'})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Estimate Cost</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Calculator className="h-8 w-8 text-primary" /><CardTitle>Estimated Cost Range</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-xl">
                    Your estimated renovation cost is between <strong>${result.low.toLocaleString(undefined, {maximumFractionDigits: 0})}</strong> and <strong>${result.high.toLocaleString(undefined, {maximumFractionDigits: 0})}</strong>.
                </p>
                <CardDescription className='mt-4'>This is a rough, ballpark estimate. Costs vary widely by location, material choices, and labor rates. Get multiple quotes from contractors.</CardDescription>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Renovation Type</h4>
                  <p>Select the type and quality level of your project. "Basic" involves cosmetic updates, "Mid" includes replacing most fixtures, and "High" involves premium materials and layout changes.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Area</h4>
                  <p>The square footage (or square meters) of the room you are renovating.</p>
              </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How The Estimate Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator provides a rough budget estimate based on industry-standard cost-per-square-foot averages for different levels of renovation. It is not a formal quote.</p>
                <ol className="list-decimal list-inside space-y-1">
                    <li><strong>Cost per Square Foot:</strong> Each renovation type (e.g., "Mid-Range Kitchen") is assigned a baseline cost per square foot.</li>
                    <li><strong>Base Calculation:</strong> The calculator multiplies your area by this baseline cost.</li>
                    <li><strong>Range:</strong> It then provides a -20% to +20% range around that base cost to account for some variability in materials and labor.</li>
                </ol>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="renovation-levels">
          <AccordionTrigger>Understanding Renovation Levels</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground">Basic / Economy</h4>
              <p>Focuses on cosmetic updates without changing the layout. Think of it as a refresh.</p>
              <ul className="list-disc list-inside space-y-1 pl-4 mt-1">
                <li><strong>Kitchen:</strong> Painting existing cabinets, new laminate countertops, basic sink/faucet, vinyl flooring.</li>
                <li><strong>Bathroom:</strong> New toilet and vanity, reglazing the tub, new vinyl flooring, fresh paint.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Mid-Range</h4>
              <p>The most common type of renovation. It involves replacing most fixtures and finishes with good quality, but not luxury, materials.</p>
              <ul className="list-disc list-inside space-y-1 pl-4 mt-1">
                <li><strong>Kitchen:</strong> New semi-custom cabinets, granite or quartz countertops, new standard appliances, tile backsplash.</li>
                <li><strong>Bathroom:</strong> New tile floor and shower surround, new tub, new vanity with stone top, improved lighting.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">High-End / Luxury</h4>
              <p>Involves top-of-the-line materials, custom work, and potentially changing the layout of the room.</p>
              <ul className="list-disc list-inside space-y-1 pl-4 mt-1">
                <li><strong>Kitchen:</strong> Custom cabinetry, high-end stone countertops, professional-grade appliances, complex lighting, possible structural changes.</li>
                <li><strong>Bathroom:</strong> Moving walls, expanding the space, walk-in shower with frameless glass, heated floors, custom vanity.</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>
         <AccordionItem value="whats-not-included">
            <AccordionTrigger>What's Not Included in These Estimates</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This simple calculator cannot account for many factors that significantly impact cost. These estimates likely DO NOT include:</p>
                <ul className="list-disc list-inside space-y-1 pl-4 mt-1">
                    <li><strong>Structural Changes:</strong> Moving walls, windows, or doors.</li>
                    <li><strong>Plumbing/Electrical Relocation:</strong> Moving sinks, toilets, outlets, or lighting fixtures.</li>
                    <li><strong>Permit Fees:</strong> Costs associated with obtaining building permits from your local municipality.</li>
                    <li><strong>Architectural/Design Fees:</strong> The cost of hiring a professional to design the space.</li>
                    <li><strong>Unforeseen Issues:</strong> Problems discovered after demolition, such as water damage, mold, or outdated wiring.</li>
                </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
