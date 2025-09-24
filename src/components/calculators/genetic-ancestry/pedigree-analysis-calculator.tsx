
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, PlusCircle, XCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const memberSchema = z.object({
  id: z.string().min(1),
  sex: z.enum(['male', 'female']),
  phenotype: z.enum(['affected', 'unaffected', 'unknown']),
  p1: z.string().optional().or(z.literal('none')),
  p2: z.string().optional().or(z.literal('none')),
});

const formSchema = z.object({
  members: z.array(memberSchema).min(1),
});

type FormValues = z.infer<typeof formSchema>;
type Member = z.infer<typeof memberSchema>;

export default function PedigreeAnalysisCalculator() {
  const [chart, setChart] = useState<Member[] | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      members: [
        { id: 'I-1', sex: 'male', phenotype: 'unaffected', p1: 'none', p2: 'none' },
        { id: 'I-2', sex: 'female', phenotype: 'affected', p1: 'none', p2: 'none' },
        { id: 'II-1', sex: 'female', phenotype: 'affected', p1: 'I-1', p2: 'I-2' },
        { id: 'II-2', sex: 'male', phenotype: 'unaffected', p1: 'I-1', p2: 'I-2' },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'members',
  });

  const onSubmit = (values: FormValues) => {
    setChart(values.members);
  };

  const memberIds = form.watch('members').map(m => m.id);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Build Pedigree Chart</CardTitle>
          <CardDescription>
            Add family members and specify their sex, phenotype (affected or unaffected by a trait), and parents to build the chart.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-[80px,100px,110px,1fr,1fr,auto] gap-2 items-center font-medium">
                  <FormLabel>ID</FormLabel>
                  <FormLabel>Sex</FormLabel>
                  <FormLabel>Phenotype</FormLabel>
                  <FormLabel>Parent 1</FormLabel>
                  <FormLabel>Parent 2</FormLabel>
                  <span></span>
              </div>
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[80px,100px,110px,1fr,1fr,auto] gap-2 items-start">
                    <FormField control={form.control} name={`members.${index}.id`} render={({ field }) => (
                        <FormItem><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name={`members.${index}.sex`} render={({ field }) => (
                        <FormItem><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name={`members.${index}.phenotype`} render={({ field }) => (
                        <FormItem><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="affected">Affected</SelectItem><SelectItem value="unaffected">Unaffected</SelectItem><SelectItem value="unknown">Unknown</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name={`members.${index}.p1`} render={({ field }) => (
                        <FormItem><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="none">-</SelectItem>{memberIds.filter(id => id !== form.getValues(`members.${index}.id`)).map(id => <SelectItem key={id} value={id}>{id}</SelectItem>)}</SelectContent></Select></FormItem>
                    )} />
                    <FormField control={form.control} name={`members.${index}.p2`} render={({ field }) => (
                        <FormItem><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="none">-</SelectItem>{memberIds.filter(id => id !== form.getValues(`members.${index}.id`)).map(id => <SelectItem key={id} value={id}>{id}</SelectItem>)}</SelectContent></Select></FormItem>
                    )} />
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}><XCircle className="h-5 w-5 text-destructive" /></Button>
                </div>
              ))}
               <Button type="button" variant="outline" size="sm" onClick={() => append({ id: '', sex: 'male', phenotype: 'unknown', p1: 'none', p2: 'none' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Member</Button>
              <Button type="submit" className="w-full">Analyze Pedigree</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {chart && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Users className="h-8 w-8 text-primary" /><CardTitle>Pedigree Analysis</CardTitle></div></CardHeader>
            <CardContent>
                <CardDescription>This is a data representation of your pedigree chart. Visualizing it would require a more complex graphical tool, but this data can be used to infer inheritance patterns (e.g., dominant, recessive, X-linked).</CardDescription>
                <pre className="mt-4 p-4 bg-muted rounded-md text-sm overflow-x-auto">
                    {JSON.stringify(chart, null, 2)}
                </pre>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This tool allows you to input data for a family pedigree. By analyzing the data—who is affected by a trait, their sex, and their relationship to others—geneticists can often determine the mode of inheritance for that trait.</p>
                <ul className="list-disc list-inside space-y-1">
                    <li><strong>Dominant vs. Recessive:</strong> If a trait appears in every generation, it's likely dominant. If it skips generations, it's likely recessive.</li>
                    <li><strong>Autosomal vs. X-linked:</strong> If a trait appears roughly equally in males and females, it's likely autosomal. If it appears more often in males, it may be X-linked recessive.</li>
                </ul>
                 <p className="mt-2">A full analysis requires a graphical chart, which is beyond the scope of this simple calculator. The JSON output represents the data you've structured.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
