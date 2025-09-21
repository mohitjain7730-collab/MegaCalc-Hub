'use client';

import { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GitBranch, PlusCircle, XCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const ancestrySchema = z.object({
    name: z.string().min(1, "Name is required"),
    p1: z.number().min(0).max(100),
    p2: z.number().min(0).max(100),
});

const formSchema = z.object({
  ancestries: z.array(ancestrySchema)
}).refine(data => {
    const sum1 = data.ancestries.reduce((acc, curr) => acc + (curr.p1 || 0), 0);
    return Math.abs(sum1 - 100) < 0.01;
}, { message: "Parent 1 percentages must add up to 100.", path: ['ancestries'] })
.refine(data => {
    const sum2 = data.ancestries.reduce((acc, curr) => acc + (curr.p2 || 0), 0);
    return Math.abs(sum2 - 100) < 0.01;
}, { message: "Parent 2 percentages must add up to 100.", path: ['ancestries'] });


type FormValues = z.infer<typeof formSchema>;
type Result = { name: string; percentage: number }[];

export default function AncestryCompositionEstimator() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ancestries: [
        { name: 'European', p1: 100, p2: 100 },
        { name: 'African', p1: 0, p2: 0 },
        { name: 'Asian', p1: 0, p2: 0 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ancestries"
  });

  const onSubmit = (values: FormValues) => {
    const estimatedResult = values.ancestries.map(anc => ({
      name: anc.name,
      percentage: (anc.p1 + anc.p2) / 2,
    })).filter(res => res.percentage > 0);
    setResult(estimatedResult);
  };
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Ancestry Input</CardTitle>
          <CardDescription>
            Define ancestry categories and enter the estimated composition for two parents. The percentages for each parent must total 100%.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-[1fr,80px,80px,auto] gap-2 items-center font-medium">
                  <FormLabel>Ancestry Name</FormLabel>
                  <FormLabel className="text-center">Parent 1 %</FormLabel>
                  <FormLabel className="text-center">Parent 2 %</FormLabel>
                  <span></span>
              </div>
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[1fr,80px,80px,auto] gap-2 items-start">
                  <FormField control={form.control} name={`ancestries.${index}.name`} render={({ field }) => (
                    <FormItem><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name={`ancestries.${index}.p1`} render={({ field }) => (
                    <FormItem><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name={`ancestries.${index}.p2`} render={({ field }) => (
                    <FormItem><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                   <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                      <XCircle className="h-5 w-5 text-destructive" />
                    </Button>
                </div>
              ))}
               <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', p1: 0, p2: 0 })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Ancestry
              </Button>
              {form.formState.errors.ancestries && <p className="text-sm font-medium text-destructive">{form.formState.errors.ancestries.message}</p>}
              <Button type="submit" className="w-full">Estimate My Composition</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><GitBranch className="h-8 w-8 text-primary" /><CardTitle>Your Estimated Ancestry Composition</CardTitle></div></CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {result.map((res) => (
                        <div key={res.name}>
                            <div className='flex justify-between items-center mb-1'>
                                <p className='font-medium'>{res.name}</p>
                                <p className='text-sm text-muted-foreground'>{res.percentage.toFixed(2)}%</p>
                            </div>
                            <div className="w-full bg-muted rounded-full h-4">
                                <div className="bg-primary h-4 rounded-full text-xs text-primary-foreground flex items-center justify-center" style={{ width: `${res.percentage}%` }}>
                                    {res.percentage > 10 && `${res.percentage.toFixed(0)}%`}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                 <CardDescription className='mt-6 text-center'>This is a simplified, illustrative tool for entertainment purposes. It averages the provided parental data and is not a substitute for professional DNA testing.</CardDescription>
            </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                This tool provides a very basic illustration of how ancestry might be inherited. It simply takes the percentage for each ancestry you provide for two parents and calculates the average. Real genetic inheritance is far more complex and involves random recombination of DNA from many ancestors.
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
