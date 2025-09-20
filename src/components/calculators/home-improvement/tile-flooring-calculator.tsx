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
  areaLength: z.number().positive('Must be positive'),
  areaWidth: z.number().positive('Must be positive'),
  tileLength: z.number().positive('Must be positive'),
  tileWidth: z.number().positive('Must be positive'),
  wastage: z.number().min(0, 'Cannot be negative').default(10),
  unit: z.enum(['meters', 'feet']),
});

type FormValues = z.infer<typeof formSchema>;

export default function TileFlooringCalculator() {
  const [result, setResult] = useState<{ tilesNeeded: number; totalArea: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'feet',
      wastage: 10,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { areaLength, areaWidth, tileLength, tileWidth, wastage, unit } = values;

    const areaUnit = unit === 'feet' ? 'sq ft' : 'sq m';
    const tileUnitFactor = unit === 'feet' ? 144 : 10000;

    const totalArea = areaLength * areaWidth;
    const tileArea = (tileLength * tileWidth) / tileUnitFactor;
    const tilesForArea = totalArea / tileArea;
    const tilesNeeded = Math.ceil(tilesForArea * (1 + wastage / 100));

    setResult({ tilesNeeded, totalArea });
  };
  
  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="unit"
                        render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel>Units</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="feet">Feet / Inches</SelectItem>
                                        <SelectItem value="meters">Meters / Centimeters</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />
                    <FormField control={form.control} name="areaLength" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Area Length ({unit})</FormLabel>
                            <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="areaWidth" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Area Width ({unit})</FormLabel>
                            <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="tileLength" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tile Length ({unit === 'feet' ? 'in' : 'cm'})</FormLabel>
                            <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="tileWidth" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tile Width ({unit === 'feet' ? 'in' : 'cm'})</FormLabel>
                            <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="wastage" render={({ field }) => (
                        <FormItem className="md:col-span-2">
                            <FormLabel>Wastage (%)</FormLabel>
                            <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                <Button type="submit">Calculate</Button>
            </form>
        </Form>
        {result && (
            <Card className="mt-8">
                <CardHeader>
                    <div className='flex items-center gap-4'>
                        <Calculator className="h-8 w-8 text-primary" />
                        <CardTitle>Result</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-lg">
                        For a total area of <strong>{result.totalArea.toFixed(2)} {unit === 'feet' ? 'sq ft' : 'sq m'}</strong>, you will need approximately <strong>{result.tilesNeeded} tiles</strong>.
                    </p>
                    <CardDescription className='mt-2'>
                        This includes a {form.getValues('wastage')}% wastage factor.
                    </CardDescription>
                </CardContent>
            </Card>
        )}
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="how-it-works">
                <AccordionTrigger>How This Calculator Works</AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                    <ol className="list-decimal list-inside space-y-1">
                        <li><strong>Total Area Calculation:</strong> It first calculates the total area to be tiled by multiplying `Area Length` by `Area Width`.</li>
                        <li><strong>Tile Area Calculation:</strong> It then calculates the area of a single tile. If using feet/inches, it converts tile dimensions from inches to feet before multiplying. If using meters/cm, it converts from cm to meters.</li>
                        <li><strong>Basic Tile Count:</strong> It divides the `Total Area` by the `Single Tile Area` to find the number of tiles that would perfectly fit.</li>
                        <li><strong>Wastage:</strong> The calculator adds the specified wastage percentage to the tile count. This accounts for cuts, breakage, and mistakes. The final number is rounded up to the nearest whole tile.</li>
                    </ol>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="pro-tips">
                <AccordionTrigger>Pro Tips for Tiling</AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-4">
                    <div>
                        <h4 className="font-semibold text-foreground mb-1">Wastage Wisdom</h4>
                        <p>A 10% wastage factor is standard for simple layouts. For complex patterns like herringbone or diagonal layouts, or for rooms with many corners and obstacles, increase wastage to 15-20%.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-1">Buy from the Same Batch</h4>
                        <p>Tiles are produced in batches (or lots). Colors and even exact sizes can vary slightly between batches. Always buy all your tiles, including extras for wastage, from the same batch to ensure a consistent look.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-1">Subfloor Preparation is Key</h4>
                        <p>A clean, level, and rigid subfloor is critical for a lasting tile job. Any flex or unevenness can lead to cracked tiles or grout down the line. Don't skip the prep work!</p>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
  );
}
