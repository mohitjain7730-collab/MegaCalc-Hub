'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dna } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const genotypeOptions = ["AA", "Aa", "aa"] as const;

const formSchema = z.object({
  p1: z.enum(genotypeOptions),
  p2: z.enum(genotypeOptions),
});

type FormValues = z.infer<typeof formSchema>;

type Result = {
    genotypes: { [key: string]: number };
    phenotypes: { dominant: number; recessive: number };
    punnettSquare: string[][];
}

export default function GeneticTraitProbabilityCalculator() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      p1: 'Aa',
      p2: 'Aa',
    },
  });

  const onSubmit = (values: FormValues) => {
    const { p1, p2 } = values;
    const alleles1 = p1.split('');
    const alleles2 = p2.split('');
    
    const genotypes: { [key: string]: number } = { AA: 0, Aa: 0, aa: 0 };
    const punnettSquare: string[][] = [[], []];

    for(let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
            const genotype = [alleles1[i], alleles2[j]].sort().join('');
            if(genotype === "aA") genotypes["Aa"]++;
            else genotypes[genotype as "AA" | "Aa" | "aa"]++;
            punnettSquare[j][i] = genotype;
        }
    }
    
    const phenotypes = {
        dominant: (genotypes.AA + genotypes.Aa) / 4 * 100,
        recessive: genotypes.aa / 4 * 100,
    };
    
    const genotypePercentages = {
        AA: genotypes.AA / 4 * 100,
        Aa: genotypes.Aa / 4 * 100,
        aa: genotypes.aa / 4 * 100,
    };

    setResult({ genotypes: genotypePercentages, phenotypes, punnettSquare });
  };

  return (
    <div className="space-y-8">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <CardDescription>Select the genotype for a single gene for both parents. 'A' represents a dominant allele, and 'a' represents a recessive allele.</CardDescription>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="p1" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Parent 1 Genotype</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {genotypeOptions.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="p2" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Parent 2 Genotype</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {genotypeOptions.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )} />
                </div>
                <Button type="submit" className="w-full">Calculate Probability</Button>
            </form>
        </Form>

        {result && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader><CardTitle>Punnett Square</CardTitle></CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-[30px,1fr,1fr] grid-rows-[30px,1fr,1fr] gap-1 text-center font-mono">
                            <div></div>
                            <div className="p-2 font-bold">{form.getValues('p1')[0]}</div>
                            <div className="p-2 font-bold">{form.getValues('p1')[1]}</div>
                            <div className="p-2 font-bold">{form.getValues('p2')[0]}</div>
                            <div className="p-4 border bg-muted">{result.punnettSquare[0][0]}</div>
                            <div className="p-4 border bg-muted">{result.punnettSquare[0][1]}</div>
                            <div className="p-2 font-bold">{form.getValues('p2')[1]}</div>
                            <div className="p-4 border bg-muted">{result.punnettSquare[1][0]}</div>
                            <div className="p-4 border bg-muted">{result.punnettSquare[1][1]}</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><div className='flex items-center gap-4'><Dna className="h-8 w-8 text-primary" /><CardTitle>Offspring Probabilities</CardTitle></div></CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="font-semibold mb-2">Genotype</h3>
                            {Object.entries(result.genotypes).map(([geno, perc]) => (
                                <div key={geno}>
                                    <div className='flex justify-between items-center mb-1'>
                                        <p className='font-mono'>{geno}</p>
                                        <p className='text-sm text-muted-foreground'>{perc}%</p>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2.5"><div className="bg-primary h-2.5 rounded-full" style={{ width: `${perc}%` }}></div></div>
                                </div>
                            ))}
                        </div>
                         <div>
                            <h3 className="font-semibold mb-2">Phenotype</h3>
                             <div>
                                <div className='flex justify-between items-center mb-1'><p>Dominant Trait</p><p className='text-sm text-muted-foreground'>{result.phenotypes.dominant}%</p></div>
                                <div className="w-full bg-muted rounded-full h-2.5"><div className="bg-primary h-2.5 rounded-full" style={{ width: `${result.phenotypes.dominant}%` }}></div></div>
                            </div>
                             <div>
                                <div className='flex justify-between items-center mb-1'><p>Recessive Trait</p><p className='text-sm text-muted-foreground'>{result.phenotypes.recessive}%</p></div>
                                <div className="w-full bg-muted rounded-full h-2.5"><div className="bg-primary h-2.5 rounded-full" style={{ width: `${result.phenotypes.recessive}%` }}></div></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This tool uses a Punnett square to visualize and calculate the probability of an offspring inheriting a particular genotype and phenotype based on the parents' genotypes for a single gene, according to the principles of Mendelian genetics.</p>
                <ul className="list-disc list-inside space-y-1">
                    <li><strong>Genotype:</strong> The genetic makeup of an organism (e.g., AA, Aa, or aa).</li>
                    <li><strong>Phenotype:</strong> The observable physical characteristic (e.g., brown eyes vs. blue eyes). A dominant allele (A) will mask a recessive allele (a).</li>
                    <li><strong>Punnett Square:</strong> A diagram used to predict the genotypes of a particular cross or breeding experiment.</li>
                </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
