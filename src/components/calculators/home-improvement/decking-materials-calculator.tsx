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
  deckLength: z.number().positive(),
  deckWidth: z.number().positive(),
  boardWidth: z.number().positive().default(5.5),
  joistSpacing: z.number().positive().default(16),
  unit: z.enum(['feet', 'meters']),
});

type FormValues = z.infer<typeof formSchema>;

export default function DeckingMaterialsCalculator() {
  const [result, setResult] = useState<{ boards: number; joists: number; fasteners: number; } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'feet',
      boardWidth: 5.5,
      joistSpacing: 16,
      deckLength: undefined,
      deckWidth: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    let { deckLength, deckWidth, boardWidth, joistSpacing, unit } = values;
    
    if (unit === 'meters') {
        deckLength *= 3.28084;
        deckWidth *= 3.28084;
        boardWidth /= 2.54; // cm to inches
        joistSpacing /= 2.54; // cm to inches
    }

    const deckArea = deckLength * deckWidth;
    const boardGap = 0.125; // 1/8 inch gap
    
    const rowsOfBoards = Math.ceil(deckWidth * 12 / (boardWidth + boardGap));
    const totalBoards = rowsOfBoards; // Assuming board length matches deck length for simplicity

    const numberOfJoists = Math.ceil(deckWidth * 12 / joistSpacing) + 1;
    
    const fastenersPerBoard = (Math.ceil(deckLength / 2)) * 2;
    const totalFasteners = fastenersPerBoard * totalBoards;


    setResult({ boards: Math.ceil(totalBoards * 1.05), joists: numberOfJoists, fasteners: Math.ceil(totalFasteners * 1.1) });
  };

  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Units</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="feet">Feet / Inches</SelectItem><SelectItem value="meters">Meters / CM</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="deckLength" render={({ field }) => (
                <FormItem><FormLabel>Deck Length ({unit})</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="deckWidth" render={({ field }) => (
                <FormItem><FormLabel>Deck Width ({unit})</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="boardWidth" render={({ field }) => (
                <FormItem><FormLabel>Deck Board Width ({unit === 'feet' ? 'in' : 'cm'})</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="joistSpacing" render={({ field }) => (
                <FormItem><FormLabel>Joist Spacing ({unit === 'feet' ? 'in' : 'cm'})</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Calculator className="h-8 w-8 text-primary" /><CardTitle>Estimated Materials</CardTitle></div></CardHeader>
            <CardContent>
                <ul className="list-disc pl-5 text-lg space-y-2">
                    <li><strong>{result.boards} decking boards</strong> (assuming they run the length of the deck)</li>
                    <li><strong>{result.joists} joists</strong> (assuming they run the width of the deck)</li>
                    <li><strong>{result.fasteners} fasteners/screws</strong></li>
                </ul>
                <CardDescription className='mt-4'>Includes 5-10% wastage. This is a simplified estimate for a rectangular deck. Consult a professional for complex designs.</CardDescription>
            </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How This Calculator Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <ol className="list-decimal list-inside space-y-1">
                    <li><strong>Decking Boards:</strong> It calculates how many rows of boards are needed to cover the deck's width, accounting for a standard 1/8 inch gap between boards. It assumes you are buying boards that match the deck's length.</li>
                    <li><strong>Joists:</strong> It calculates the number of support joists needed based on the deck's width and the specified center-to-center joist spacing.</li>
                    <li><strong>Fasteners:</strong> It estimates two fasteners per joist for each board.</li>
                    <li>A 5-10% wastage factor is added to the final counts.</li>
                </ol>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
