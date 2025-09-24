
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
import { Users, PlusCircle, XCircle, Lightbulb } from 'lucide-react';
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
type AnalysisResult = {
  possibleModes: string[];
  reasoning: string[];
};

export default function PedigreeAnalysisCalculator() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

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
  
  const analyzePedigree = (members: Member[]): AnalysisResult => {
      const reasoning: string[] = [];
      let isDominantPossible = true;
      let isRecessivePossible = true;
      
      const memberMap = new Map(members.map(m => [m.id, m]));

      // Check for key patterns
      for (const member of members) {
          const p1 = member.p1 && member.p1 !== 'none' ? memberMap.get(member.p1) : null;
          const p2 = member.p2 && member.p2 !== 'none' ? memberMap.get(member.p2) : null;

          if (p1 && p2) {
              // Two unaffected parents have an affected child -> Must be recessive
              if (p1.phenotype === 'unaffected' && p2.phenotype === 'unaffected' && member.phenotype === 'affected') {
                  isDominantPossible = false;
                  reasoning.push(`Unaffected parents (${p1.id}, ${p2.id}) having an affected child (${member.id}) strongly indicates a RECESSIVE trait.`);
              }
              // Two affected parents have an unaffected child -> Must be dominant
              if (p1.phenotype === 'affected' && p2.phenotype === 'affected' && member.phenotype === 'unaffected') {
                  isRecessivePossible = false;
                  reasoning.push(`Affected parents (${p1.id}, ${p2.id}) having an unaffected child (${member.id}) strongly indicates a DOMINANT trait.`);
              }
          }
      }

      if (isDominantPossible && isRecessivePossible && reasoning.length === 0) {
          reasoning.push("No definitive dominant or recessive patterns found. More data may be needed.");
      }

      const possibleModes: string[] = [];
      if (isDominantPossible) possibleModes.push("Autosomal Dominant", "X-linked Dominant");
      if (isRecessivePossible) possibleModes.push("Autosomal Recessive", "X-linked Recessive");

      return { possibleModes, reasoning };
  };

  const onSubmit = (values: FormValues) => {
    setAnalysis(analyzePedigree(values.members));
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

      {analysis && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Users className="h-8 w-8 text-primary" /><CardTitle>Pedigree Analysis</CardTitle></div></CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-lg">Possible Modes of Inheritance</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {analysis.possibleModes.map(mode => (
                                <div key={mode} className="bg-primary/10 text-primary-foreground border border-primary/20 rounded-full px-3 py-1 text-sm font-medium text-primary">{mode}</div>
                            ))}
                        </div>
                    </div>
                     <div>
                        <h3 className="font-semibold text-lg">Conclusion & Reasoning</h3>
                        <div className="mt-2 text-muted-foreground space-y-2">
                             {analysis.reasoning.map((reason, index) => (
                                <div key={index} className="flex items-start gap-2">
                                    <Lightbulb className="h-4 w-4 mt-1 shrink-0" />
                                    <p>{reason}</p>
                                </div>
                            ))}
                        </div>
                        <CardDescription className="mt-4 text-xs">This is a simplified analysis. Complex factors like incomplete penetrance or variable expressivity are not considered.</CardDescription>
                    </div>
                </div>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This tool analyzes the data you provide to look for classic Mendelian inheritance patterns. By checking relationships between affected and unaffected individuals, it can make educated guesses about how a trait is passed down.</p>
                <ul className="list-disc list-inside space-y-1">
                    <li><strong>Dominant vs. Recessive:</strong> It looks for tell-tale signs, like unaffected parents having an affected child (which points to recessive) or the trait appearing in every generation (which suggests dominant).</li>
                    <li><strong>Autosomal vs. X-linked:</strong> It can sometimes infer sex-linked traits, for example if a trait is seen far more often in males than females. This analysis is less definitive than dominant/recessive.</li>
                </ul>
                 <p className="mt-2">A full analysis requires a graphical chart and can be complex, but this provides a starting point for understanding your data.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
