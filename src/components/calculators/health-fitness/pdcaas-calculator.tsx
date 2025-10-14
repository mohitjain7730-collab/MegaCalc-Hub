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
    <section
  className="space-y-4 text-muted-foreground leading-relaxed"
  itemScope
  itemType="https://schema.org/Article"
>
  <meta
    itemProp="headline"
    content="Food Protein Digestibility Corrected Amino Acid Score (PDCAAS) Calculator – Measure Protein Quality & Amino Acid Value"
  />
  <meta itemProp="author" content="MegaCalc Hub Team" />
  <meta
    itemProp="about"
    content="Use the PDCAAS Calculator to determine protein quality based on amino acid composition and digestibility. Learn how different foods rank and optimize your protein intake for muscle growth and health."
  />

  <h2 itemProp="name" className="text-xl font-bold text-foreground">
    PDCAAS Calculator – Measure True Protein Quality of Your Foods
  </h2>
  <p itemProp="description">
    Not all proteins are created equal. Some provide every essential amino acid your body needs, while others lack one or more.  
    The <strong>Food Protein Digestibility Corrected Amino Acid Score (PDCAAS)</strong> is the gold-standard method for evaluating the <strong>quality of a protein source</strong> based on its amino acid composition and digestibility.  
    This calculator helps you estimate the PDCAAS of your meals or protein powders and compare plant and animal proteins scientifically.
  </p>

  <h3 className="font-semibold text-foreground mt-6">What Is PDCAAS?</h3>
  <p>
    The <strong>PDCAAS (Protein Digestibility Corrected Amino Acid Score)</strong> is a standardized measure developed by the FAO/WHO.  
    It rates protein quality by comparing the amino acid profile of a food with human requirements and adjusting it for digestibility.  
    A score of <strong>1.0 (or 100%)</strong> means the protein provides all essential amino acids in sufficient amounts and is fully digestible — typical of high-quality animal proteins like whey or eggs.
  </p>

  <h3 className="font-semibold text-foreground mt-6">PDCAAS Formula</h3>
  <p>
    The calculation follows this formula:
  </p>
  <p className="font-mono bg-muted p-2 rounded">
    PDCAAS = (mg of limiting amino acid in 1g of test protein ÷ mg of same amino acid in 1g of reference protein) × True Digestibility
  </p>
  <p>
    The <strong>limiting amino acid</strong> is the essential amino acid present in the lowest proportion relative to human needs.  
    Once this amino acid is identified, its ratio to the ideal pattern is multiplied by the food’s digestibility to get the PDCAAS.
  </p>

  <h3 className="font-semibold text-foreground mt-6">PDCAAS Rating Scale</h3>
  <ul className="list-disc ml-6 space-y-1">
    <li><strong>1.0 (Excellent):</strong> Whey, casein, egg white, soy protein isolate</li>
    <li><strong>0.9–0.99 (High):</strong> Beef, chicken, milk, pea protein blends</li>
    <li><strong>0.7–0.89 (Moderate):</strong> Lentils, quinoa, chickpeas, oats</li>
    <li><strong>0.5–0.69 (Low):</strong> Wheat, rice, nuts, beans (without combination)</li>
    <li><strong>&lt; 0.5 (Poor):</strong> Gelatin, cornmeal, processed cereal grains</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">
    Common PDCAAS Scores of Popular Protein Sources
  </h3>
  <table className="w-full border border-border text-sm">
    <thead className="bg-muted text-foreground font-semibold">
      <tr>
        <th className="p-2 text-left">Protein Source</th>
        <th className="p-2 text-right">PDCAAS</th>
      </tr>
    </thead>
    <tbody>
      <tr><td className="p-2">Whey Protein Isolate</td><td className="p-2 text-right">1.00</td></tr>
      <tr><td className="p-2">Casein</td><td className="p-2 text-right">1.00</td></tr>
      <tr><td className="p-2">Egg White</td><td className="p-2 text-right">1.00</td></tr>
      <tr><td className="p-2">Soy Protein Isolate</td><td className="p-2 text-right">1.00</td></tr>
      <tr><td className="p-2">Beef</td><td className="p-2 text-right">0.92</td></tr>
      <tr><td className="p-2">Pea Protein</td><td className="p-2 text-right">0.82</td></tr>
      <tr><td className="p-2">Oats</td><td className="p-2 text-right">0.57</td></tr>
      <tr><td className="p-2">Wheat Gluten</td><td className="p-2 text-right">0.25</td></tr>
      <tr><td className="p-2">Rice Protein</td><td className="p-2 text-right">0.59</td></tr>
      <tr><td className="p-2">Peanut Protein</td><td className="p-2 text-right">0.52</td></tr>
    </tbody>
  </table>

  <h3 className="font-semibold text-foreground mt-6">
    How to Use the PDCAAS Calculator
  </h3>
  <ol className="list-decimal ml-6 space-y-1">
    <li>Select your protein source or combination (e.g., Whey, Soy, Pea, Lentil).</li>
    <li>Enter the amount of protein per serving.</li>
    <li>Enter digestibility percentage (most proteins range 80–100%).</li>
    <li>The calculator estimates the PDCAAS and shows whether your protein intake meets ideal amino acid requirements.</li>
  </ol>
  <p>
    You can also use the tool to combine multiple foods — for example, rice and beans — to see how their complementary amino acids improve the total PDCAAS.
  </p>

  <h3 className="font-semibold text-foreground mt-6">Why PDCAAS Matters</h3>
  <ul className="list-disc ml-6 space-y-1">
    <li><strong>Measures true protein quality</strong> — not just quantity.</li>
    <li><strong>Helps plan vegetarian and vegan diets</strong> by identifying amino acid gaps.</li>
    <li><strong>Assists athletes and bodybuilders</strong> in selecting the most efficient protein sources for muscle recovery.</li>
    <li><strong>Useful for food manufacturers</strong> in labeling “complete” protein blends.</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">Limitations of PDCAAS</h3>
  <p>
    While PDCAAS is widely used, it has some limitations:
  </p>
  <ul className="list-disc ml-6 space-y-1">
    <li>It truncates all scores above 1.0, so very high-quality proteins (like whey) appear the same as others with lower actual amino acid surpluses.</li>
    <li>It’s based on rat models, not direct human digestion studies.</li>
    <li>It doesn’t account for the bioavailability of specific amino acids after cooking or processing.</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">Alternative Metrics: DIAAS</h3>
  <p>
    The <strong>Digestible Indispensable Amino Acid Score (DIAAS)</strong> is a newer, more precise method proposed by the FAO.  
    Unlike PDCAAS, it does not truncate values above 1.0 and measures digestibility for each amino acid at the ileal (small intestine) level.  
    However, PDCAAS remains the global standard for food labeling and practical nutrition.
  </p>

  <h3 className="font-semibold text-foreground mt-6">Tips to Improve Protein Quality in Meals</h3>
  <ul className="list-disc ml-6 space-y-1">
    <li>Combine plant proteins — e.g., rice + beans or hummus + whole wheat bread.</li>
    <li>Add small portions of animal protein (egg or dairy) to plant-based meals.</li>
    <li>Use protein isolates with PDCAAS ≥ 0.9 when possible.</li>
    <li>Include vitamin B6 and zinc sources for optimal amino acid metabolism.</li>
    <li>Cook with gentle methods (steaming, boiling) to preserve amino acids.</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">PDCAAS vs. Protein Quantity</h3>
  <p>
    Many people focus only on total grams of protein — but 20g of a low-quality protein may provide fewer usable amino acids than 10g of a complete one.  
    The PDCAAS Calculator helps you shift from <strong>quantity-based to quality-based nutrition planning</strong>.
  </p>

  <h3 className="font-semibold text-foreground mt-6">FAQ</h3>
  <div className="space-y-3">
    <p><strong>What is a good PDCAAS score?</strong> A score of 1.0 is excellent, meaning the protein is complete and fully digestible. Anything above 0.8 is considered high-quality.</p>
    <p><strong>Why does soy have a PDCAAS of 1.0?</strong> Because it contains all essential amino acids in sufficient amounts and is easily digestible, making it the best plant protein match to animal sources.</p>
    <p><strong>How can vegans improve PDCAAS?</strong> Combine different plant sources — grains + legumes — to cover amino acid gaps.</p>
    <p><strong>Is PDCAAS the same as protein digestibility?</strong> No. Digestibility is one factor; PDCAAS also includes amino acid balance.</p>
    <p><strong>Which is better: PDCAAS or DIAAS?</strong> DIAAS is more precise scientifically, but PDCAAS is the official labeling standard in most countries.</p>
  </div>

  <h3 className="font-semibold text-foreground mt-6">Related Calculators</h3>
  <div className="space-y-2">
    <p><Link href="/category/health-fitness/protein-requirement-calculator" className="text-primary underline">Daily Protein Requirement Calculator</Link></p>
    <p><Link href="/category/health-fitness/amino-acid-ratio-calculator" className="text-primary underline">Amino Acid Ratio Calculator</Link></p>
    <p><Link href="/category/health-fitness/diaas-calculator" className="text-primary underline">DIAAS (Digestible Amino Acid Score) Calculator</Link></p>
    <p><Link href="/category/health-fitness/muscle-protein-synthesis-calculator" className="text-primary underline">Muscle Protein Synthesis Calculator</Link></p>
  </div>

  <h3 className="font-semibold text-foreground mt-6">Quick Takeaways</h3>
  <ul className="list-disc ml-6 space-y-1">
    <li>PDCAAS measures protein quality based on amino acid profile and digestibility.</li>
    <li>1.0 = complete protein (ideal amino acid pattern).</li>
    <li>Use calculator to find the most efficient protein sources for your goals.</li>
    <li>Combine plant proteins to raise overall PDCAAS in vegetarian diets.</li>
    <li>DIAAS is the modern alternative metric but PDCAAS remains widely accepted.</li>
  </ul>

  <p className="italic mt-4">
    Disclaimer: This calculator is for educational and dietary guidance purposes only. It should not replace professional nutrition advice. Always consult your dietitian or healthcare provider before major dietary changes or supplement use.
  </p>
</section>
  );
}


