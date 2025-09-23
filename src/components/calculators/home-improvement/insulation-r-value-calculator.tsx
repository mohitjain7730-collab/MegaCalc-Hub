'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Thermometer, HelpCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';


const insulationTypes = {
  fiberglassBatt: { name: 'Fiberglass Batt', rValue: 3.2 },
  rockwoolBatt: { name: 'Rockwool Batt', rValue: 3.8 },
  celluloseBlown: { name: 'Cellulose (Blown-in)', rValue: 3.5 },
  sprayFoamOpen: { name: 'Spray Foam (Open Cell)', rValue: 3.6 },
  sprayFoamClosed: { name: 'Spray Foam (Closed Cell)', rValue: 6.5 },
  xpsFoamBoard: { name: 'XPS Foam Board', rValue: 5.0 },
};

const formSchema = z.object({
  insulationType: z.coerce.number(),
  targetRValue: z.coerce.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

interface ChartDataItem {
    name: string;
    thickness: number;
}

export default function InsulationRValueCalculator() {
  const [result, setResult] = useState<{ thickness: number, chartData: ChartDataItem[] } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      insulationType: insulationTypes.fiberglassBatt.rValue,
      targetRValue: 21
    },
  });

  const onSubmit = (values: FormValues) => {
    const { insulationType, targetRValue } = values;
    const thickness = targetRValue / insulationType;

    const chartData = Object.values(insulationTypes).map(type => ({
        name: type.name,
        thickness: parseFloat((targetRValue / type.rValue).toFixed(2)),
    }));

    setResult({ thickness, chartData });
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
                  <FormLabel className="flex items-center gap-2">
                    Insulation Type
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild><button type="button" className='p-0 m-0'><HelpCircle className="h-4 w-4 text-muted-foreground" /></button></TooltipTrigger>
                        <TooltipContent><p>This is the material's thermal resistance per inch of thickness.</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <Select onValueChange={(val) => field.onChange(parseFloat(val))} defaultValue={String(field.value)}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {Object.values(insulationTypes).map((type) => (
                        <SelectItem key={type.name} value={String(type.rValue)}>
                          {type.name} (R-{type.rValue}/inch)
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
                  <FormLabel className="flex items-center gap-2">
                    Target R-Value
                     <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild><button type="button" className='p-0 m-0'><HelpCircle className="h-4 w-4 text-muted-foreground" /></button></TooltipTrigger>
                        <TooltipContent><p className="max-w-xs">Total thermal resistance needed. Varies by climate and location (e.g., walls, attic). Higher is better.</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <FormControl>
                    <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={String(field.value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="13">R-13 (Standard 2x4 Walls)</SelectItem>
                            <SelectItem value="21">R-21 (Standard 2x6 Walls)</SelectItem>
                            <SelectItem value="30">R-30 (Attic - Mild Climates)</SelectItem>
                            <SelectItem value="38">R-38 (Attic - Moderate Climates)</SelectItem>
                            <SelectItem value="49">R-49 (Attic - Cold Climates)</SelectItem>
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
              <CardTitle>Results for Target R-{form.getValues('targetRValue')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-6">
              You will need approximately <strong>{result.thickness.toFixed(2)} inches</strong> of your chosen insulation.
            </p>
            <CardDescription className='mb-4'>Comparison of required thickness across different materials:</CardDescription>
             <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={result.chartData} layout="vertical" margin={{ left: 100 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" unit=" in" />
                        <YAxis type="category" dataKey="name" width={100} interval={0} />
                        <RechartsTooltip formatter={(value) => `${value} inches`} />
                        <Bar dataKey="thickness" name="Required Thickness" fill="hsl(var(--primary))" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
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
