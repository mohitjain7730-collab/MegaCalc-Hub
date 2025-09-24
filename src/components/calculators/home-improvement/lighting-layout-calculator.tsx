
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
import { Lightbulb } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const roomTypes = {
  livingRoom: 20,
  kitchen: 40,
  bedroom: 15,
  bathroom: 75,
  office: 50,
};

const formSchema = z.object({
  roomLength: z.number().positive(),
  roomWidth: z.number().positive(),
  lumensPerFixture: z.number().positive().default(800),
  roomType: z.nativeEnum(roomTypes),
  unit: z.enum(['feet', 'meters']),
});

type FormValues = z.infer<typeof formSchema>;

export default function LightingLayoutCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'feet',
      lumensPerFixture: 800,
      roomType: roomTypes.livingRoom,
      roomLength: undefined,
      roomWidth: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    let { roomLength, roomWidth, lumensPerFixture, roomType, unit } = values;

    let area = roomLength * roomWidth;
    if (unit === 'meters') {
        area *= 10.7639; // convert to sq ft
    }

    const totalLumensNeeded = area * roomType;
    const fixturesNeeded = Math.ceil(totalLumensNeeded / lumensPerFixture);
    setResult(fixturesNeeded);
  };

  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem><FormLabel>Units</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="feet">Feet</SelectItem><SelectItem value="meters">Meters</SelectItem></SelectContent></Select></FormItem>
            )} />
             <FormField control={form.control} name="roomType" render={({ field }) => (
                <FormItem><FormLabel>Room Type</FormLabel><Select onValueChange={(v) => field.onChange(parseFloat(v))} defaultValue={String(field.value)}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>
                    {Object.entries(roomTypes).map(([key, value]) => (<SelectItem key={key} value={String(value)}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</SelectItem>))}
                </SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="roomLength" render={({ field }) => (
                <FormItem><FormLabel>Room Length ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="roomWidth" render={({ field }) => (
                <FormItem><FormLabel>Room Width ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="lumensPerFixture" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Lumens per Fixture/Bulb</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Lightbulb className="h-8 w-8 text-primary" /><CardTitle>Result</CardTitle></div></CardHeader>
          <CardContent>
            <p className="text-lg">You will need approximately <strong>{result} fixtures/bulbs</strong> to properly light the room.</p>
            <CardDescription className='mt-2'>This is a general guide. Consider using dimmers and multiple light sources (task, ambient, accent) for best results.</CardDescription>
          </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Room Dimensions</h4>
                  <p>The length and width of the room. This is used to calculate the total square footage.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Room Type</h4>
                  <p>Different rooms require different levels of brightness. A kitchen or office needs more light (higher foot-candles) than a living room or bedroom.</p>
              </div>
               <div>
                  <h4 className="font-semibold text-foreground mb-1">Lumens per Fixture/Bulb</h4>
                  <p>The brightness of a single light bulb, measured in lumens. A standard 60W incandescent bulb is about 800 lumens. Check the packaging of your chosen bulb for its lumen rating.</p>
              </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <ol className="list-decimal list-inside space-y-1">
                    <li><strong>Foot-Candles:</strong> Each room type has a recommended brightness level, measured in "foot-candles" (lumens per square foot).</li>
                    <li><strong>Total Lumens:</strong> It calculates the room's square footage and multiplies it by the recommended foot-candles to find the total lumens needed.</li>
                    <li><strong>Fixtures Needed:</strong> Divides the total lumens needed by the lumen output of a single fixture or bulb.</li>
                </ol>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
