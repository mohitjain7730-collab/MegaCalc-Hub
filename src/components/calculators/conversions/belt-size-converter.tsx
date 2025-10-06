
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HandHelping } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  unit: z.enum(['inch', 'cm']),
  waist: z.number().min(20).max(60),
});

type FormValues = z.infer<typeof formSchema>;

interface Result {
  us: number;
  uk: number;
  eu: number;
}

export default function BeltSizeConverter() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'inch',
      waist: 32,
    },
  });

  const { watch, setValue } = form;
  const unit = watch('unit');
  const waist = watch('waist');

  useEffect(() => {
    let waistInInches = unit === 'inch' ? waist : waist / 2.54;
    let beltInInches = waistInInches + 2;

    let usSize = Math.round(beltInInches);
    let ukSize = usSize;
    let euSize = Math.round(beltInInches * 2.54);

    setResult({ us: usSize, uk: ukSize, eu: euSize });
  }, [unit, waist]);

  const handleUnitChange = (newUnit: 'inch' | 'cm') => {
    const currentWaist = form.getValues('waist');
    let newWaist = currentWaist;

    if (unit === 'inch' && newUnit === 'cm') {
      newWaist = currentWaist * 2.54;
    } else if (unit === 'cm' && newUnit === 'inch') {
      newWaist = currentWaist / 2.54;
    }
    
    setValue('unit', newUnit);
    setValue('waist', parseFloat(newWaist.toFixed(1)));
  }

  const min = unit === 'inch' ? 20 : 50;
  const max = unit === 'inch' ? 60 : 152;
  const step = unit === 'inch' ? 0.5 : 1;

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Unit</FormLabel>
                  <Select onValueChange={(value: 'inch' | 'cm') => handleUnitChange(value)} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="inch">Inches (in)</SelectItem>
                      <SelectItem value="cm">Centimeters (cm)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
            <FormField
              control={form.control}
              name="waist"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Waist Size: {waist} {unit === 'inch' ? 'in' : 'cm'}</FormLabel>
                  <FormControl>
                    <Slider
                      min={min}
                      max={max}
                      step={step}
                      value={[field.value]}
                      onValueChange={(vals) => field.onChange(vals[0])}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <HandHelping className="h-8 w-8 text-primary" />
              <CardTitle>Recommended Belt Sizes</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-3 border rounded-lg">
                    <p className="font-semibold">US Size</p>
                    <p className="text-xl font-bold">{result.us}"</p>
                </div>
                <div className="p-3 border rounded-lg">
                    <p className="font-semibold">UK Size</p>
                    <p className="text-xl font-bold">{result.uk}"</p>
                </div>
                <div className="p-3 border rounded-lg">
                    <p className="font-semibold">EU Size</p>
                    <p className="text-xl font-bold">{result.eu} cm</p>
                </div>
            </div>
          </CardContent>
        </Card>
      )}

       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator follows the standard convention for belt sizing:</p>
                <ol className="list-decimal list-inside space-y-2 mt-2">
                    <li>It takes your waist measurement (the size of your trousers/pants).</li>
                    <li>It adds 2 inches to your waist size to determine the ideal belt size in inches. This extra length allows the belt to be comfortably buckled in the middle hole.</li>
                    <li>It then converts this ideal inch-based size to its equivalent in other regional systems, such as centimeters for the EU market.</li>
                </ol>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
