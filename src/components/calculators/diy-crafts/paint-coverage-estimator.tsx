
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PaintBucket, HelpCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const formSchema = z.object({
  length: z.number().positive('Must be positive'),
  width: z.number().positive('Must be positive'),
  height: z.number().positive('Must be positive'),
  coats: z.number().min(0, 'Cannot be negative').default(2),
  unit: z.enum(['meters', 'feet']),
  coveragePerUnit: z.number().positive('Must be positive'),
});

type FormValues = z.infer<typeof formSchema>;

export default function PaintCoverageEstimator() {
  const [result, setResult] = useState<{ paintNeeded: number; unit: 'liters' | 'gallons' } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      length: undefined,
      width: undefined,
      height: undefined,
      coats: 2,
      unit: 'feet',
      coveragePerUnit: 350, // 350 sq ft per gallon
    },
  });

  const onSubmit = (values: FormValues) => {
    const { length, width, height, coats, unit, coveragePerUnit } = values;

    // We're assuming a rectangular room and including the ceiling.
    const wallArea1 = length * height;
    const wallArea2 = width * height;
    const totalWallArea = (wallArea1 + wallArea2) * 2;
    const ceilingArea = length * width;
    const totalArea = totalWallArea + ceilingArea;
    const totalAreaToPaint = totalArea * coats;

    const paintNeeded = totalAreaToPaint / coveragePerUnit;
    
    setResult({ paintNeeded, unit: unit === 'feet' ? 'gallons' : 'liters' });
  };
  
  const handleUnitChange = (unit: 'meters' | 'feet') => {
    form.setValue('unit', unit);
    if (unit === 'meters') {
        form.setValue('coveragePerUnit', 10); // Approx. 10 sq m per liter
    } else {
        form.setValue('coveragePerUnit', 350); // Approx. 350 sq ft per gallon
    }
  }

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
                                <Select onValueChange={(value: 'meters' | 'feet') => handleUnitChange(value)} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select unit" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="feet">Feet (ft)</SelectItem>
                                        <SelectItem value="meters">Meters (m)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="length"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Room Length</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="width"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Room Width</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="height"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Room Height</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="coats"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Number of Coats</FormLabel>
                                <FormControl>
                                    <Input type="number" step="1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="coveragePerUnit"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  Paint Coverage ({form.getValues('unit') === 'feet' ? 'sq ft / gallon' : 'sq m / liter'})
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button type="button" className='p-0 m-0'><HelpCircle className="h-4 w-4 text-muted-foreground" /></button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="max-w-xs text-sm">Most paints cover 350-400 sq ft per gallon (9-10 sq m per liter). Check your paint can for the most accurate value.</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button type="submit">Calculate</Button>
            </form>
        </Form>
        {result && (
            <Card className="mt-8">
                <CardHeader>
                    <div className='flex items-center gap-4'>
                        <PaintBucket className="h-8 w-8 text-primary" />
                        <CardTitle>Result</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-lg">
                        You will need approximately <strong>{Math.ceil(result.paintNeeded)} {result.unit}</strong> of paint.
                    </p>
                    <CardDescription className='mt-2'>
                        This is an estimate. It's recommended to buy a little extra to account for touch-ups and variations in surface porosity.
                    </CardDescription>
                </CardContent>
            </Card>
        )}
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Room Dimensions</h4>
                    <p>Enter the length, width, and height of your room. This calculator assumes a rectangular room and includes the ceiling area by default.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Number of Coats</h4>
                    <p>The number of coats of paint you plan to apply. Two coats is standard for good coverage, especially when changing colors.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Paint Coverage</h4>
                    <p>This is the most crucial value for an accurate estimate. It's found on the paint can label and tells you how much area one gallon (or liter) of that specific paint will cover. A common estimate is 350-400 sq ft per gallon.</p>
                </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="how-it-works">
            <AccordionTrigger>How This Calculator Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
              <p>The calculator determines the total paintable area and divides it by the paint's coverage rate.</p>
              <ol className="list-decimal list-inside space-y-1">
                  <li><strong>Calculates Wall Area:</strong> It finds the area of all four walls using the formula: `(2 * Length * Height) + (2 * Width * Height)`.</li>
                  <li><strong>Calculates Ceiling Area:</strong> It finds the area of the ceiling: `Length * Width`. This is included by default.</li>
                  <li><strong>Total Area:</strong> It sums the wall and ceiling areas. The calculation does not subtract for windows or doors, as this extra amount is a good buffer.</li>
                  <li><strong>Coats:</strong> The total area is multiplied by the number of coats you plan to apply.</li>
                  <li><strong>Paint Needed:</strong> Finally, it divides the total area to be painted by the coverage per gallon/liter specified on your paint can.</li>
              </ol>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="pro-tips">
            <AccordionTrigger>Pro Tips for Your Painting Project</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Check Your Paint Can</h4>
                  <p>The `Paint Coverage` value is the most important factor for accuracy. You can almost always find this on the paint can label, listed as sq ft per gallon or sq m per liter.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Surface Texture Matters</h4>
                  <p>Porous, unprimed, or heavily textured surfaces (like popcorn ceilings or rough plaster) will absorb more paint, reducing the actual coverage. You may need up to 25% more paint for these surfaces.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Primer is Your Friend</h4>
                  <p>Using a primer, especially when painting over a dark color with a lighter one, can save you from needing extra coats of your more expensive top-coat paint.</p>
              </div>
               <div>
                  <h4 className="font-semibold text-foreground mb-1">Buy a Little Extra</h4>
                  <p>It's always a good rule of thumb to buy about 10-15% more paint than you estimate. This ensures you have enough for touch-ups and won't have to make a frantic trip back to the store for a slightly different color batch.</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
    </div>
  );
}
