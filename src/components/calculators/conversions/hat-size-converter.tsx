
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Ruler } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

const formSchema = z.object({
  unit: z.enum(['cm', 'in', 'us', 'eu', 'jp']),
  value: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

interface Result {
  cm: number;
  in: number;
  us: string;
  eu: number;
  jp: number;
}

const toFraction = (decimal: number) => {
    if (decimal === 0) return '0';
    const whole = Math.floor(decimal);
    const fracDecimal = decimal - whole;
    if (fracDecimal === 0) return String(whole);

    const tolerance = 1.0E-6;
    let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
    let b = fracDecimal;
    do {
        let a = Math.floor(b);
        let aux = h1; h1 = a * h1 + h2; h2 = aux;
        aux = k1; k1 = a * k1 + k2; k2 = aux;
        b = 1 / (b - a);
    } while (Math.abs(fracDecimal - h1 / k1) > fracDecimal * tolerance);

    let numerator = k1;
    let denominator = h1;
    if (denominator > 8) { // Simplify to nearest 1/8 for common hat sizes
        numerator = Math.round(fracDecimal * 8);
        denominator = 8;
    }
    const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
    const divisor = gcd(numerator, denominator);
    numerator /= divisor;
    denominator /= divisor;

    if (numerator === 0) return whole > 0 ? String(whole) : '';
    
    return `${whole > 0 ? whole + ' ' : ''}${numerator}/${denominator}`;
};


export default function HatSizeConverter() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'cm',
      value: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { unit, value } = values;
    let cm = 0;

    switch (unit) {
      case "cm": cm = value; break;
      case "in": cm = value * 2.54; break;
      case "us": cm = value * Math.PI * 2.54; break;
      case "eu": cm = value; break;
      case "jp": cm = value; break;
    }

    const inches = cm / 2.54;
    const usDecimal = inches / Math.PI;

    setResult({
      cm,
      in: inches,
      us: toFraction(usDecimal),
      eu: Math.round(cm),
      jp: Math.round(cm),
    });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CardDescription>
                Convert your head circumference between cm, inches, and regional hat sizes (US, UK, EU, India, Japan).
            </CardDescription>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="unit" render={({ field }) => (
                    <FormItem><FormLabel>Input Unit</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="cm">Centimeters (cm)</SelectItem>
                                <SelectItem value="in">Inches (in)</SelectItem>
                                <SelectItem value="us">US / UK Size</SelectItem>
                                <SelectItem value="eu">EU / India Size</SelectItem>
                                <SelectItem value="jp">Japan Size (cm)</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormItem>
                )} />
                <FormField control={form.control} name="value" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                        <FormLabel>Value</FormLabel>
                        <FormControl><Input type="number" step="0.1" placeholder="e.g. 58 or 7.25" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>
            <Button type="submit" className="w-full">Convert Size</Button>
        </form>
      </Form>
      
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Ruler className="h-8 w-8 text-primary" /><CardTitle>Converted Sizes</CardTitle></div></CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div className="p-3 border rounded"><p className="text-gray-500">Centimeters (cm)</p><p className="font-semibold text-lg">{result.cm.toFixed(1)}</p></div>
                    <div className="p-3 border rounded"><p className="text-gray-500">Inches (in)</p><p className="font-semibold text-lg">{result.in.toFixed(2)}</p></div>
                    <div className="p-3 border rounded"><p className="text-gray-500">US / UK Size</p><p className="font-semibold text-lg">{result.us}</p></div>
                    <div className="p-3 border rounded"><p className="text-gray-500">EU / India Size</p><p className="font-semibold text-lg">{result.eu}</p></div>
                    <div className="p-3 border rounded"><p className="text-gray-500">Japan Size</p><p className="font-semibold text-lg">{result.jp}</p></div>
                </div>
                 <CardDescription className="mt-4 text-xs">Note: EU, India and Japan sizes usually correspond to head circumference in cm. If you’re between two sizes, choose the larger one for comfort.</CardDescription>
            </CardContent>
        </Card>
      )}
        
      <Accordion type="single" collapsible defaultValue='how-it-works' className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This hat size converter uses a set of mathematical formulas to estimate equivalent sizes across different measurement systems. It converts your input to a base unit (centimeters) and then calculates all other sizes from there, including a fractional representation for US/UK sizes.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="space-y-4 prose prose-sm dark:prose-invert max-w-none">
        <h3 className='font-bold'>👕 Complete Understanding of Global Hat Size Conversion</h3>
        <p className="text-xs">Finding the right hat size can be confusing, especially when brands and regions use completely different systems. A US size 7 isn’t the same as an EU size 56. This guide explains how global hat sizes work, how to measure yourself correctly, and how to use size conversion charts to shop confidently.</p>
        
        <h4 className='font-bold'>🧭 1. Why Hat Sizes Differ Around the World</h4>
        <p className="text-xs">Hat sizes differ mainly because of regional traditions and measurement systems (inches vs. centimeters).</p>
        <ul className="list-disc list-inside text-xs">
          <li>The US and UK use a system based on the diameter of the head in inches.</li>
          <li>The EU and India use a simpler system based directly on the head circumference in centimeters.</li>
          <li>Japan also uses centimeters but sometimes sizes are labeled one size up.</li>
        </ul>
        
        <h4 className='font-bold'>📏 2. How to Measure Your Head Correctly</h4>
        <p className="text-xs">Before using any hat size chart or converter, take an accurate measurement of your head circumference.</p>
        <h5 className='font-bold text-xs'>Step-by-Step Measurement Guide</h5>
        <ol className="list-decimal list-inside text-xs">
          <li>Get a flexible measuring tape. If you don’t have one, use a piece of string and a ruler.</li>
          <li>Wrap the tape around your head, placing it just above your eyebrows and ears, where a hat would normally sit.</li>
          <li>Make sure the tape is level all around and snug, but not too tight.</li>
          <li>Note the measurement in either centimeters or inches.</li>
          <li>Measure two or three times to ensure accuracy.</li>
        </ol>

        <h4 className='font-bold'>📊 3. Standard Hat Size Conversion Chart</h4>
        <Table>
          <TableHeader><TableRow><TableHead>Head (cm)</TableHead><TableHead>Inches</TableHead><TableHead>US/UK</TableHead><TableHead>EU/India</TableHead><TableHead>General</TableHead></TableRow></TableHeader>
          <TableBody>
            <TableRow><TableCell>52</TableCell><TableCell>20.5</TableCell><TableCell>6 1/2</TableCell><TableCell>52</TableCell><TableCell>XS</TableCell></TableRow>
            <TableRow><TableCell>54</TableCell><TableCell>21.3</TableCell><TableCell>6 3/4</TableCell><TableCell>54</TableCell><TableCell>S</TableCell></TableRow>
            <TableRow><TableCell>56</TableCell><TableCell>22.0</TableCell><TableCell>7</TableCell><TableCell>56</TableCell><TableCell>M</TableCell></TableRow>
            <TableRow><TableCell>58</TableCell><TableCell>22.8</TableCell><TableCell>7 1/4</TableCell><TableCell>58</TableCell><TableCell>L</TableCell></TableRow>
            <TableRow><TableCell>60</TableCell><TableCell>23.6</TableCell><TableCell>7 1/2</TableCell><TableCell>60</TableCell><TableCell>XL</TableCell></TableRow>
            <TableRow><TableCell>62</TableCell><TableCell>24.4</TableCell><TableCell>7 3/4</TableCell><TableCell>62</TableCell><TableCell>XXL</TableCell></TableRow>
          </TableBody>
        </Table>
        <p className="text-xs">💡 Pro tip: If you’re between two sizes, always go for the larger one, especially for structured hats.</p>

        <h4 className='font-bold'>🌍 4. Regional Hat Sizing Systems</h4>
        <p className="text-xs">Here’s a breakdown of how each region defines sizes:</p>
        <ul className="list-disc list-inside text-xs">
            <li><strong>US / UK Hat Sizes:</strong> Expressed as fractions of head circumference in inches divided by π (3.14).</li>
            <li><strong>European / Indian Hat Sizes:</strong> Based directly on head circumference in centimeters.</li>
            <li><strong>Japanese Hat Sizes:</strong> Also based on centimeters, often matching the EU size.</li>
            <li><strong>International Sizes (Label System):</strong> Uses XS to XXL for general categorization.</li>
        </ul>

        <h4 className='font-bold'>🎩 5. Common Hat Types and Their Fits</h4>
        <p className="text-xs">Not all hats fit the same. Here’s a quick rundown:</p>
        <ul className="list-disc list-inside text-xs">
          <li><strong>Baseball Caps:</strong> Usually adjustable (one size fits most).</li>
          <li><strong>Fedoras:</strong> Structured and fitted; exact size is important.</li>
          <li><strong>Beanies:</strong> Stretchable fabric, typically free-size.</li>
          <li><strong>Cowboy Hats:</strong> Structured; correct fitting is crucial.</li>
        </ul>

        <h4 className='font-bold'>🧮 6. The Hat Size Formula</h4>
        <p className="text-xs">To calculate hat size manually:</p>
        <p className="font-mono text-xs p-2 bg-muted rounded-md">US/UK Size = Head Circumference (in) / π</p>
        <p className="font-mono text-xs p-2 bg-muted rounded-md">EU/India Size = Head Circumference (cm)</p>

        <h4 className='font-bold'>🧢 7. Adjusting Between Brands</h4>
        <p className="text-xs">Even within the same country, brand sizing can differ. Always check a brand’s specific size guide before buying.</p>

        <h4 className='font-bold'>👶 8. Children’s Hat Sizes</h4>
        <p className="text-xs">Kids’ sizes grow quickly. A general guide:</p>
        <Table>
          <TableHeader><TableRow><TableHead>Age</TableHead><TableHead>Approx. Head (cm)</TableHead></TableRow></TableHeader>
          <TableBody>
            <TableRow><TableCell>6–12 months</TableCell><TableCell>44–46</TableCell></TableRow>
            <TableRow><TableCell>1–2 years</TableCell><TableCell>46–48</TableCell></TableRow>
            <TableRow><TableCell>2–4 years</TableCell><TableCell>48–50</TableCell></TableRow>
            <TableRow><TableCell>4–8 years</TableCell><TableCell>50–52</TableCell></TableRow>
          </TableBody>
        </Table>

        <h4 className='font-bold'>🧵 9. Materials and Their Impact on Fit</h4>
        <ul className="list-disc list-inside text-xs">
          <li><strong>Wool:</strong> Shrinks slightly over time.</li>
          <li><strong>Cotton:</strong> Stable fit.</li>
          <li><strong>Leather:</strong> Stretches with use.</li>
        </ul>

        <h4 className='font-bold'>🧼 10. Caring for Your Hat</h4>
        <p className="text-xs">Proper maintenance preserves shape and size. Avoid moisture, store in a dry place, and use a hat box or stand.</p>

        <h4 className='font-bold'>💡 11. Tips for Buying Hats Online</h4>
        <ul className="list-disc list-inside text-xs">
            <li>Always measure your head before buying.</li>
            <li>Check brand-specific size charts.</li>
            <li>Read product reviews for fit accuracy.</li>
        </ul>

        <h4 className='font-bold'>🔁 12. Quick Reference Conversion Table (Unisex)</h4>
        <Table>
            <TableHeader><TableRow><TableHead>US/UK</TableHead><TableHead>EU/India (cm)</TableHead><TableHead>Inches</TableHead><TableHead>Label</TableHead></TableRow></TableHeader>
            <TableBody>
                <TableRow><TableCell>6 3/4</TableCell><TableCell>54</TableCell><TableCell>21.3</TableCell><TableCell>S</TableCell></TableRow>
                <TableRow><TableCell>7</TableCell><TableCell>56</TableCell><TableCell>22.0</TableCell><TableCell>M</TableCell></TableRow>
                <TableRow><TableCell>7 1/4</TableCell><TableCell>58</TableCell><TableCell>22.8</TableCell><TableCell>L</TableCell></TableRow>
                <TableRow><TableCell>7 1/2</TableCell><TableCell>60</TableCell><TableCell>23.6</TableCell><TableCell>XL</TableCell></TableRow>
            </TableBody>
        </Table>

        <h4 className='font-bold'>🔍 13. FAQs on Hat Sizing</h4>
        <p className="text-xs"><strong>Q1. How do I know my correct hat size?</strong><br/>Measure your head’s circumference just above your eyebrows and ears, then refer to a size chart.</p>
        <p className="text-xs"><strong>Q2. What if my size falls between two measurements?</strong><br/>Choose the larger size, especially for structured hats.</p>
        <p className="text-xs"><strong>Q3. Do Indian hat sizes follow European standards?</strong><br/>Yes, most Indian brands use centimeters (EU standard).</p>

        <h4 className='font-bold'>🧭 14. Final Thoughts</h4>
        <p className="text-xs">A perfect hat doesn’t just complement your outfit — it completes your personality. By understanding how to measure your head and how sizing systems differ, you can always find a comfortable, stylish fit.</p>

        <h4 className='font-bold'>🔗 Related Calculators and Converters</h4>
        <ul className="list-disc list-inside text-xs">
            <li><Link href="/category/conversions/shoe-size-converter" className="text-primary underline">👟 Universal Shoe Size Converter</Link></li>
            <li><Link href="/category/conversions/cloth-size-converter" className="text-primary underline">👕 Universal Clothing Size Converter</Link></li>
            <li><Link href="/category/conversions/ring-size-converter" className="text-primary underline">💍 Ring Size Converter</Link></li>
        </ul>
      </div>
    </div>
  );
}
