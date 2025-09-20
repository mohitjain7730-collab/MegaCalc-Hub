'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Thermometer } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const insulationTypes = {
  fiberglassBatt: 3.2,
  rockwoolBatt: 3.8,
  celluloseBlown: 3.5,
  sprayFoamOpen: 3.6,
  sprayFoamClosed: 6.5,
  xpsFoamBoard: 5.0,
};

const formSchema = z.object({
  insulationType: z.nativeEnum(insulationTypes),
  targetRValue: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function InsulationRValueCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      insulationType: insulationTypes.fiberglassBatt,
      targetRValue: 21
    },
  });

  const onSubmit = (values: FormValues) => {
    const { insulationType, targetRValue } = values;
    const thickness = targetRValue / insulationType;
    setResult(thickness);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="insulationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Insulation Type</FormLabel>
                  <Select onValueChange={(val) => field.onChange(parseFloat(val))} defaultValue={String(field.value)}>
                    <FormControl>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(insulationTypes).map(([key, value]) => (
                        <SelectItem key={key} value={String(value)}>
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} (R-{value}/inch)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="targetRValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target R-Value</FormLabel>
                  <FormControl>
                    <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={String(field.value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="13">R-13 (2x4 Walls)</SelectItem>
                            <SelectItem value="21">R-21 (2x6 Walls)</SelectItem>
                            <SelectItem value="30">R-30 (Attic)</SelectItem>
                            <SelectItem value="38">R-38 (Attic)</SelectItem>
                            <SelectItem value="49">R-49 (Attic)</SelectItem>
                        </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Thermometer className="h-8 w-8 text-primary" />
              <CardTitle>Result</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              You will need approximately <strong>{result.toFixed(2)} inches</strong> of your chosen insulation to achieve an R-Value of {form.getValues('targetRValue')}.
            </p>
            <CardDescription className='mt-2'>This is a direct calculation. Always check manufacturer specifications.</CardDescription>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How This Calculator Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>R-Value is a measure of thermal resistance. A higher R-Value means better insulation. Different materials have different R-Values per inch of thickness.</p>
            <ol className="list-decimal list-inside space-y-1">
              <li><strong>Select Material:</strong> Each insulation material has a specific R-Value per inch.</li>
              <li><strong>Select Target:</strong> Choose the desired total R-Value for your wall or attic, often determined by local building codes.</li>
              <li><strong>Calculate Thickness:</strong> The calculator divides the `Target R-Value` by the material's R-Value per inch to determine the required thickness in inches.</li>
            </ol>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
