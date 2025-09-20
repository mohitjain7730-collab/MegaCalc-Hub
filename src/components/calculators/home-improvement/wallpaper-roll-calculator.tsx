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

const formSchema = z.object({
  wallHeight: z.number().positive(),
  wallWidth: z.number().positive(),
  rollLength: z.number().positive(),
  rollWidth: z.number().positive(),
  patternRepeat: z.number().min(0).default(0),
  unit: z.enum(['meters', 'feet']),
});

type FormValues = z.infer<typeof formSchema>;

export default function WallpaperRollCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        unit: 'feet',
        patternRepeat: 0,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { wallHeight, wallWidth, rollLength, rollWidth, patternRepeat, unit } = values;

    const wastageFactor = 1.1; // 10% wastage

    // Calculate how many drops are needed for the wall
    const dropsNeeded = Math.ceil(wallWidth / rollWidth);

    // Calculate the length of each drop, accounting for pattern repeat
    const dropLength = wallHeight + (patternRepeat > 0 ? patternRepeat : 0);
    
    // Calculate how many full drops can be cut from a single roll
    const dropsPerRoll = Math.floor(rollLength / dropLength);

    if (dropsPerRoll === 0) {
        // This indicates a single roll isn't long enough for even one drop.
        // This is an edge case, but good to handle.
        // Let's calculate based on total length needed.
        const totalLengthNeeded = dropsNeeded * dropLength;
        const rollsNeeded = Math.ceil(totalLengthNeeded / rollLength);
        setResult(rollsNeeded);
        return;
    }

    // Calculate the number of rolls needed
    const rollsNeeded = Math.ceil(dropsNeeded / dropsPerRoll);
    
    setResult(Math.ceil(rollsNeeded * wastageFactor));
  };
  
  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="unit" render={({ field }) => (
                        <FormItem className="md:col-span-2">
                            <FormLabel>Units</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="feet">Feet / Inches</SelectItem>
                                    <SelectItem value="meters">Meters / Centimeters</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="wallHeight" render={({ field }) => (
                        <FormItem><FormLabel>Wall Height ({unit})</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="wallWidth" render={({ field }) => (
                        <FormItem><FormLabel>Total Wall Width ({unit})</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="rollLength" render={({ field }) => (
                        <FormItem><FormLabel>Roll Length ({unit})</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="rollWidth" render={({ field }) => (
                        <FormItem><FormLabel>Roll Width ({unit === 'feet' ? 'in' : 'cm'})</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="patternRepeat" render={({ field }) => (
                        <FormItem className="md:col-span-2"><FormLabel>Pattern Repeat ({unit === 'feet' ? 'in' : 'cm'}) (0 if none)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <Button type="submit">Calculate</Button>
            </form>
        </Form>
        {result !== null && (
            <Card className="mt-8">
                <CardHeader><div className='flex items-center gap-4'><Calculator className="h-8 w-8 text-primary" /><CardTitle>Result</CardTitle></div></CardHeader>
                <CardContent>
                    <p className="text-lg">You will need approximately <strong>{result} rolls</strong> of wallpaper.</p>
                    <CardDescription className='mt-2'>This includes a 10% wastage factor. It's always better to have a little extra.</CardDescription>
                </CardContent>
            </Card>
        )}
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="how-it-works">
                <AccordionTrigger>How This Calculator Works</AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                    <ol className="list-decimal list-inside space-y-1">
                        <li><strong>Drops Needed:</strong> Divides the total wall width by the roll width to determine how many vertical strips (drops) of wallpaper you need.</li>
                        <li><strong>Drop Length:</strong> Calculates the length needed for each drop by adding the wall height and the pattern repeat distance. This ensures you can align the pattern on each strip.</li>
                        <li><strong>Drops per Roll:</strong> Divides the roll length by the required drop length to see how many full drops you can cut from a single roll.</li>
                        <li><strong>Rolls Needed:</strong> Divides the total number of drops needed by the number of drops you can get from one roll.</li>
                        <li><strong>Wastage:</strong> A 10% wastage factor is added to the final count to account for mistakes and offcuts. The final result is rounded up.</li>
                    </ol>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="pro-tips">
                <AccordionTrigger>Pro Tips for Wallpapering</AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-4">
                    <div><h4 className="font-semibold text-foreground mb-1">Measure Twice, Cut Once</h4><p>Carefully measure your walls, and don't forget to subtract large openings like doors and windows from your total wall width measurement.</p></div>
                    <div><h4 className="font-semibold text-foreground mb-1">Understand Pattern Repeat</h4><p>The pattern repeat is the vertical distance between one point in the pattern to the identical point below or above it. You need to account for this to ensure the design matches up seamlessly between drops.</p></div>
                    <div><h4 className="font-semibold text-foreground mb-1">Prep Your Walls</h4><p>A smooth, clean, and primed wall is essential for good adhesion and a professional finish. Fill any holes or cracks and sand them smooth before you begin.</p></div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
  );
}
