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
import { Gem } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

const STANDARD_RING_SIZES = [
  {US: 3, UK: 'F', dia: 13.7, circ: 43.1, EU: 44, JP: 4},
  {US: 3.5, UK: 'G', dia: 14.1, circ: 44.3, EU: 45, JP: 5},
  {US: 4, UK: 'H', dia: 14.5, circ: 45.5, EU: 46, JP: 6},
  {US: 4.5, UK: 'I', dia: 14.9, circ: 46.8, EU: 47, JP: 7},
  {US: 5, UK: 'J', dia: 15.3, circ: 48.0, EU: 49, JP: 9},
  {US: 5.5, UK: 'K', dia: 15.7, circ: 49.3, EU: 50, JP:10},
  {US: 6, UK: 'L', dia: 16.1, circ: 50.6, EU: 51, JP:11},
  {US: 6.5, UK: 'M', dia: 16.5, circ: 51.8, EU: 52, JP:12},
  {US: 7, UK: 'N', dia: 16.9, circ: 53.1, EU: 54, JP:14},
  {US: 7.5, UK: 'O', dia: 17.3, circ: 54.4, EU: 55, JP:15},
  {US: 8, UK: 'P', dia: 17.7, circ: 55.7, EU: 56, JP:16},
  {US: 8.5, UK: 'Q', dia: 18.1, circ: 57.0, EU: 58, JP:17},
  {US: 9, UK: 'R', dia: 18.5, circ: 58.3, EU: 59, JP:18},
  {US: 9.5, UK: 'S', dia: 19.0, circ: 59.5, EU: 60, JP:19},
  {US: 10, UK: 'T', dia: 19.4, circ: 60.8, EU: 62, JP:20},
  {US: 10.5, UK: 'U', dia: 19.8, circ: 62.1, EU: 63, JP:22},
  {US: 11, UK: 'V', dia: 20.2, circ: 63.3, EU: 64, JP:23},
  {US: 11.5, UK: 'W', dia: 20.6, circ: 64.6, EU: 66, JP:25},
  {US: 12, UK: 'X', dia: 21.0, circ: 65.9, EU: 67, JP:26},
  {US: 12.5, UK: 'Y', dia: 21.4, circ: 67.2, EU: 68, JP:27},
  {US: 13, UK: 'Z', dia: 21.8, circ: 68.5, EU: 70, JP:28}
];

const formSchema = z.object({
  unit: z.enum(['cm', 'in', 'us', 'uk', 'eu', 'jp']),
  value: z.string().min(1, "Please enter a value."),
});

type FormValues = z.infer<typeof formSchema>;

interface Result {
  diameter: number;
  circumference: number;
  closestStandard: string;
  closestDiff: number;
  resUS: number;
  resUK: string;
  resEU: number;
  resJP: number;
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


export default function RingSizeConverter() {
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
    
    const parsedValue = parseValueAsNumberOrText(value);
    if (parsedValue === null) {
      form.setError('value', { message: 'Please enter a value.' });
      return;
    }

    let diameterMm = NaN;
    let circumferenceMm = NaN;
    const PI = Math.PI;

    if (unit === 'cm') {
      const v = Number(parsedValue);
      if (!isFinite(v) || v <= 0) { form.setError('value', { message: 'Enter a positive number for circumference in cm' }); return; }
      circumferenceMm = v * 10;
      diameterMm = circumferenceMm / PI;
    } else if (unit === 'in') {
      const v = Number(parsedValue);
      if (!isFinite(v) || v <= 0) { form.setError('value', { message: 'Enter a positive number for inches' }); return; }
      circumferenceMm = v * 25.4;
      diameterMm = circumferenceMm / PI;
    } else if (unit === 'us') {
      const v = Number(parsedValue);
      if (!isFinite(v) || v <= 0) { form.setError('value', { message: 'Enter a positive numeric US size (e.g. 7 or 6.5)' }); return; }
      diameterMm = diameterFromUS(v);
      circumferenceMm = diameterMm * PI;
    } else if (unit === 'uk') {
      const letter = String(parsedValue).toUpperCase();
      const entry = STANDARD_RING_SIZES.find(s => s.UK === letter);
      if (!entry) { form.setError('value', { message: 'UK/India letter not recognized. Use letters like F, G, H...Z' }); return; }
      diameterMm = entry.dia;
      circumferenceMm = entry.circ;
    } else if (unit === 'eu' || unit === 'jp') {
        const v = Number(parsedValue);
        if (!isFinite(v) || v <= 0) { form.setError('value', { message: 'Enter a positive number' }); return; }
        if (unit === 'eu') {
            circumferenceMm = v;
            diameterMm = v / PI;
        } else { // jp
            diameterMm = v;
            circumferenceMm = v * PI;
        }
    }

    if(isNaN(diameterMm)) {
        form.setError('value', {message: 'Invalid input for selected type.'});
        return;
    }

    let best = STANDARD_RING_SIZES[0];
    let bestDiff = Math.abs(circumferenceMm - best.circ);
    for (const s of STANDARD_RING_SIZES) {
      const diff = Math.abs(circumferenceMm - s.circ);
      if (diff < bestDiff) {
        best = s; bestDiff = diff;
      }
    }

    setResult({
      diameter: diameterMm,
      circumference: circumferenceMm,
      closestStandard: `${best.US} (UK ${best.UK})`,
      closestDiff: circumferenceMm - best.circ,
      resUS: interpolateUS(circumferenceMm),
      resUK: best.UK,
      resEU: Math.round(circumferenceMm),
      resJP: Math.round(diameterMm),
    });
    
    form.clearErrors();
  };

  const clearAll = () => {
    form.reset();
    setResult(null);
  }
  
  const example = () => {
    form.setValue('unit', 'us');
    form.setValue('value', '7');
    form.handleSubmit(onSubmit)();
  }

  // helper to parse input that may be letter or number
  const parseValueAsNumberOrText = (val: string | null | undefined): string | number | null => {
    if (val === null || val === undefined) return null;
    const t = String(val).trim();
    if (t === '') return null;
    if (/[A-Za-z]/.test(t)) return t.toUpperCase();
    const num = Number(t.replace(',', '.'));
    return isNaN(num) ? t.toUpperCase() : num;
  }
  
  // helper: approximate diameter from a numeric US size by linear interpolation across table entries
  const diameterFromUS = (usSize: number) => {
    const arr = STANDARD_RING_SIZES;
    if (usSize <= arr[0].US) return arr[0].dia;
    if (usSize >= arr[arr.length-1].US) return arr[arr.length-1].dia;
    for (let i=0;i<arr.length-1;i++){
      const a = arr[i], b = arr[i+1];
      if (usSize >= a.US && usSize <= b.US) {
        const t = (usSize - a.US) / (b.US - a.US);
        return a.dia + t * (b.dia - a.dia);
      }
    }
    return arr[0].dia;
  }
  
  // helper: approximate US numeric size from circumference by interpolation
  const interpolateUS = (circumferenceMm: number) => {
    const arr = STANDARD_RING_SIZES;
    if (circumferenceMm <= arr[0].circ) return arr[0].US;
    if (circumferenceMm >= arr[arr.length-1].circ) return arr[arr.length-1].US;
    for (let i=0;i<arr.length-1;i++){
      const a = arr[i], b = arr[i+1];
      if (circumferenceMm >= a.circ && circumferenceMm <= b.circ) {
        const t = (circumferenceMm - a.circ) / (b.circ - a.circ);
        return a.US + t * (b.US - a.US);
      }
    }
    return arr[0].US;
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CardDescription>
                Convert ring sizes across US, UK (letter), EU (circumference mm), India (UK letters), and Japan (diameter mm). Enter any supported input and click Convert.
            </CardDescription>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="unit" render={({ field }) => (
                    <FormItem><FormLabel>Input Unit</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="cm">Circumference (cm)</SelectItem>
                                <SelectItem value="in">Circumference (in)</SelectItem>
                                <SelectItem value="us">US Size</SelectItem>
                                <SelectItem value="uk">UK/India Size</SelectItem>
                                <SelectItem value="eu">EU Size (mm)</SelectItem>
                                <SelectItem value="jp">Japan Size (mm)</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormItem>
                )} />
                <FormField control={form.control} name="value" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                        <FormLabel>Value</FormLabel>
                        <FormControl><Input placeholder="e.g. 5.4, 17.3, 7, O" {...field} value={field.value ?? ''} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>
            <div className="flex gap-2">
                <Button type="submit">Convert Size</Button>
                <Button type="button" variant="secondary" onClick={example}>Example: US 7</Button>
                <Button type="button" variant="destructive" className="ml-auto" onClick={clearAll}>Clear</Button>
            </div>
        </form>
      </Form>
      
      {result && (
        <Card id="result" className="mt-6">
            <CardHeader><div className='flex items-center gap-4'><Gem className="h-8 w-8 text-primary" /><CardTitle>Converted Sizes</CardTitle></div></CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="p-3 border rounded"><p className="text-sm text-muted-foreground">Inner Diameter</p><p className="text-xl font-medium">{result.diameter.toFixed(2)} mm</p></div>
                    <div className="p-3 border rounded"><p className="text-sm text-muted-foreground">Inner Circumference</p><p className="text-xl font-medium">{result.circumference.toFixed(1)} mm</p></div>
                    <div className="p-3 border rounded"><p className="text-sm text-muted-foreground">Closest Standard</p><p className="text-xl font-medium">{result.closestStandard}</p><CardDescription className="text-xs">Diff: {result.closestDiff.toFixed(1)} mm</CardDescription></div>
                </div>
                <div className="p-3 border rounded">
                  <p className="text-sm text-muted-foreground">Regional Size Estimates</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div><strong>US:</strong> {result.resUS.toFixed(2)}</div>
                    <div><strong>UK / India:</strong> {result.resUK}</div>
                    <div><strong>EU:</strong> {result.resEU}</div>
                    <div><strong>Japan:</strong> {result.resJP}</div>
                  </div>
                </div>
                 <CardDescription className="mt-4 text-xs">Tip: For wider bands, consider going up half a size. Measure at the end of the day when fingers are warm for best fit.</CardDescription>
            </CardContent>
        </Card>
      )}
        
      <Accordion type="single" collapsible defaultValue='how-it-works' className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                This converter uses a standard international ring size chart as its base. It first converts your input into a standardized metric (inner circumference in mm). Then, using that standard measurement, it finds the closest matching sizes in all other regional systems, including interpolating for US sizes for greater accuracy.
            </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="space-y-4 prose prose-sm dark:prose-invert max-w-none">
        <h3>🧭 Complete Understanding of Ring Size Conversion (US, UK, EU, India &amp; Japan)</h3>
        <p className="text-xs">Finding the perfect ring size can be surprisingly tricky — what fits perfectly in one country might feel loose or tight in another. That’s why having a ring size converter is essential when buying or gifting jewelry internationally.</p>
        <p className="text-xs">In this guide, we’ll walk you through everything you need to know about ring size measurement, conversion between US, UK, EU, India, and Japan, and how to measure your ring size at home — with clear charts, formulas, and tips.</p>
        <h4><strong>🔹 What Is Ring Size?</strong></h4>
        <p className="text-xs">Your ring size represents the inner circumference or diameter of a ring that fits comfortably on your finger. Each country follows its own measurement system — for example:</p>
        <Table>
            <TableHeader><TableRow><TableHead>Country</TableHead><TableHead>System</TableHead><TableHead>Measured As</TableHead></TableRow></TableHeader>
            <TableBody>
                <TableRow><TableCell>US</TableCell><TableCell>Numeric (e.g., 7, 8, 9)</TableCell><TableCell>Internal diameter in mm</TableCell></TableRow>
                <TableRow><TableCell>UK / India</TableCell><TableCell>Alphabetic (e.g., M, N, O)</TableCell><TableCell>Internal circumference in mm</TableCell></TableRow>
                <TableRow><TableCell>EU</TableCell><TableCell>Numeric (e.g., 52, 54, 56)</TableCell><TableCell>Circumference in mm</TableCell></TableRow>
                <TableRow><TableCell>Japan</TableCell><TableCell>Numeric (e.g., 14, 15)</TableCell><TableCell>Diameter in mm</TableCell></TableRow>
            </TableBody>
        </Table>
        <h4><strong>🔹 Formula to Convert Between Diameter and Circumference</strong></h4>
        <p className="text-xs">The fundamental relation is simple:</p>
        <p className="font-mono text-xs p-2 bg-muted rounded-md">Circumference (mm) = π × Diameter (mm)</p>
        <p className="text-xs">Example: If the inner diameter is 17.3 mm, Circumference = 17.3 × 3.1416 = 54.4 mm (EU size 54)</p>
        <h4><strong>🔹 How to Measure Ring Size at Home</strong></h4>
        <p className="text-xs">You can find your perfect ring size using just a piece of string, paper, or an existing ring.</p>
        <p className="text-xs"><strong>Method 1: Using a String or Paper Strip</strong></p>
        <ol className="list-decimal list-inside text-xs space-y-1">
          <li>Wrap a string or strip of paper around the base of your finger.</li>
          <li>Mark where it overlaps.</li>
          <li>Measure the length in millimeters — this is your circumference.</li>
          <li>Use the chart below to find your corresponding US or UK size.</li>
        </ol>
        <p className="text-xs mt-2"><strong>Method 2: Using an Existing Ring</strong></p>
         <ol className="list-decimal list-inside text-xs space-y-1">
          <li>Take a ring that fits perfectly.</li>
          <li>Measure the inner diameter in millimeters.</li>
          <li>Match the diameter in the table to find your equivalent ring size.</li>
        </ol>
        <h4><strong>🔹 Average Ring Sizes (for Reference)</strong></h4>
        <Table>
            <TableHeader><TableRow><TableHead>Category</TableHead><TableHead>Common Sizes</TableHead></TableRow></TableHeader>
            <TableBody>
                <TableRow><TableCell>Women (India/US)</TableCell><TableCell>US 5 to 7.5 (UK J½ to O)</TableCell></TableRow>
                <TableRow><TableCell>Men (India/US)</TableCell><TableCell>US 8.5 to 11 (UK Q½ to V½)</TableCell></TableRow>
            </TableBody>
        </Table>
        <p className="text-xs mt-2">💡 Fun fact: The average women’s ring size globally is US 6.5, and men’s is US 10.</p>
        <h4><strong>🔹 Common Mistakes to Avoid</strong></h4>
        <ul className="list-disc list-inside text-xs space-y-1">
          <li>Measuring cold fingers: Fingers shrink when cold — measure at the end of the day when they’re warm.</li>
          <li>Ignoring band width: Wider rings fit tighter; go half a size up.</li>
          <li>Using non-flat string: Thick string or tape can give inaccurate results.</li>
          <li>Confusing diameter with circumference: Always double-check which one you’re using.</li>
          <li>Forgetting finger dominance: Dominant hand fingers are slightly larger (0.25–0.5 size difference).</li>
        </ul>
        <h4><strong>🔹 FAQs on Ring Size Conversion</strong></h4>
        <p className="text-xs"><strong>1. What is the difference between US and UK ring sizes?</strong><br/>US sizes use numbers (like 7), while UK and India use letters (like O). US 7 = UK N = 17.3 mm diameter.</p>
        <p className="text-xs"><strong>2. What is the easiest way to find your ring size?</strong><br/>Use a ring size converter tool or measure your ring’s diameter with a ruler and compare it with a ring size chart.</p>
        <p className="text-xs"><strong>3. Are ring sizes unisex?</strong><br/>Yes. Both men and women use the same measurement scales; only the average range differs.</p>
        <h4><strong>🔹 Related Calculators and Converters</strong></h4>
         <ul className="list-disc list-inside text-xs space-y-1">
            <li><Link href="/category/conversions/shoe-size-converter" className="text-primary underline">👟 Universal Shoe Size Converter</Link></li>
            <li><Link href="/category/conversions/cloth-size-converter" className="text-primary underline">👕 Universal Clothing Size Converter</Link></li>
            <li><Link href="/category/conversions/hat-size-converter" className="text-primary underline">🧢 Hat Size Converter</Link></li>
        </ul>
      </div>

    </div>
  );
}
