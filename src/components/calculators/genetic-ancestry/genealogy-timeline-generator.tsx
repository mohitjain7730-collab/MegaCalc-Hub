'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, PlusCircle, XCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const ancestorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  birthYear: z.number().min(0).max(new Date().getFullYear()),
  deathYear: z.number().min(0).optional(),
}).refine(data => !data.deathYear || data.deathYear >= data.birthYear, {
  message: "Death year must be after birth year",
  path: ["deathYear"],
});

const formSchema = z.object({
  ancestors: z.array(ancestorSchema),
});

type FormValues = z.infer<typeof formSchema>;
type Ancestor = z.infer<typeof ancestorSchema>;

export default function GenealogyTimelineGenerator() {
  const [timeline, setTimeline] = useState<Ancestor[] | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ancestors: [
        { name: 'Self', birthYear: 1990 },
        { name: 'Parent 1', birthYear: 1965, deathYear: 2020 },
        { name: 'Parent 2', birthYear: 1967 },
        { name: 'Grandparent 1', birthYear: 1940, deathYear: 2010 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ancestors"
  });

  const onSubmit = (values: FormValues) => {
    const sortedTimeline = [...values.ancestors].sort((a, b) => a.birthYear - b.birthYear);
    setTimeline(sortedTimeline);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Ancestor Data</CardTitle>
          <CardDescription>
            Add your ancestors' names and birth/death years to generate a timeline.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[1fr,100px,100px,auto] gap-2 items-start">
                  <FormField control={form.control} name={`ancestors.${index}.name`} render={({ field }) => (
                    <FormItem><FormLabel className="sr-only">Name</FormLabel><FormControl><Input placeholder="Name" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name={`ancestors.${index}.birthYear`} render={({ field }) => (
                    <FormItem><FormLabel className="sr-only">Birth Year</FormLabel><FormControl><Input type="number" placeholder="Birth Year" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                  )} />
                   <FormField control={form.control} name={`ancestors.${index}.deathYear`} render={({ field }) => (
                    <FormItem><FormLabel className="sr-only">Death Year</FormLabel><FormControl><Input type="number" placeholder="Death Year" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                    <XCircle className="h-5 w-5 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', birthYear: undefined, deathYear: undefined })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Ancestor
              </Button>
              <Button type="submit" className="w-full">Generate Timeline</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {timeline && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Calendar className="h-8 w-8 text-primary" /><CardTitle>Ancestral Timeline</CardTitle></div></CardHeader>
            <CardContent>
                <div className="relative border-l-2 border-primary pl-6 space-y-8">
                    {timeline.map((ancestor, index) => (
                        <div key={index} className="relative">
                            <div className="absolute -left-[34px] top-1/2 -translate-y-1/2 h-4 w-4 bg-primary rounded-full border-4 border-background"></div>
                            <p className="font-bold text-lg">{ancestor.name}</p>
                            <p className="text-muted-foreground">{ancestor.birthYear} - {ancestor.deathYear || 'Present'}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                This tool simply takes the ancestor data you provide and sorts it by birth year to create a chronological list. It provides a simple visual representation of your family history through time.
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
