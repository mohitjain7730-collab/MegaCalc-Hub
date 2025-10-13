'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Utensils } from 'lucide-react';

const formSchema = z.object({ aminoAcidScore: z.number().min(0).max(1), trueDigestibility: z.number().min(0).max(1) });
type FormValues = z.infer<typeof formSchema>;

export default function PdcaasCalculator() {
  const [pdcaas, setPdcaas] = useState<number | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { aminoAcidScore: undefined as unknown as number, trueDigestibility: undefined as unknown as number } });
  const onSubmit = (v: FormValues) => setPdcaas(Math.min(1, v.aminoAcidScore * v.trueDigestibility));

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="aminoAcidScore" render={({ field }) => (<FormItem><FormLabel>Amino Acid Score (0–1)</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="trueDigestibility" render={({ field }) => (<FormItem><FormLabel>True Digestibility (0–1)</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          <Button type="submit">Calculate PDCAAS</Button>
        </form>
      </Form>
      {pdcaas !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Utensils className="h-8 w-8 text-primary" /><CardTitle>PDCAAS Result</CardTitle></div></CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold">{pdcaas.toFixed(2)}</p>
              <CardDescription>Scores are truncated at 1.0; higher means better protein quality.</CardDescription>
            </div>
          </CardContent>
        </Card>
      )}
      <PdcaasGuide />
    </div>
  );
}

export function PdcaasGuide() {
  return (
    <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
      <meta itemProp="headline" content="PDCAAS Calculator – Protein Quality, Digestibility, and Practical Meal Planning" />
      <meta itemProp="author" content="MegaCalc Hub Team" />
      <meta itemProp="about" content="How PDCAAS is calculated, protein completeness, digestibility, limitations vs DIAAS, and how to combine foods for higher quality." />

      <h2 itemProp="name" className="text-xl font-bold text-foreground">What PDCAAS Measures</h2>
      <p itemProp="description">PDCAAS (Protein Digestibility Corrected Amino Acid Score) multiplies a protein’s amino‑acid score by its true digestibility, then truncates at 1.0. It reflects how well a protein meets essential amino‑acid requirements after digestion.</p>

      <h3 className="font-semibold text-foreground mt-6">Completeness and Limiting Amino Acids</h3>
      <p>Proteins lacking enough of an essential amino acid (the “limiting” amino acid) reduce overall score. Animal proteins (whey, casein, eggs) typically score near 1.0; many plant proteins score lower individually, but blending (e.g., pea + rice) raises the composite score.</p>

      <h3 className="font-semibold text-foreground mt-6">PDCAAS vs DIAAS</h3>
      <p>DIAAS (Digestible Indispensable Amino Acid Score) uses ileal digestibility and does not truncate values, offering more nuance. However, PDCAAS remains common in labeling. For everyday planning, both encourage complete amino‑acid profiles and digestibility.</p>

      <h3 className="font-semibold text-foreground mt-6">Practical Tips</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Prioritize high‑quality proteins (dairy, eggs, lean meats) or use plant blends (soy, pea + rice).</li>
        <li>Spread protein across meals (~0.4–0.6 g/kg/meal) to maximize muscle protein synthesis.</li>
        <li>Cook and process legumes properly (soaking/fermenting) to improve digestibility.</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
      <div className="space-y-2">
        <p><Link href="/category/health-fitness/protein-intake-calculator" className="text-primary underline">Protein Intake Calculator</Link></p>
        <p><Link href="/category/health-fitness/keto-macro-calculator" className="text-primary underline">Keto Macro Calculator</Link></p>
      </div>
    </section>
  );
}


