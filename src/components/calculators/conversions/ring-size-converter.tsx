
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
  unit: z.enum(['circumference', 'diameter', 'us', 'uk', 'eu', 'jp']),
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

const PI = Math.PI;

export default function RingSizeConverter() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'circumference',
      value: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { unit, value } = values;
    
    const parsedValue = parseValueAsNumberOrText(value);
    if (parsedValue === null) {
      form.setError('value', { message: 'Please enter a value.' });
      return;
    }

    let diameterMm = NaN;
    let circumferenceMm = NaN;

    if (unit === 'circumference' || unit === 'eu') {
      const v = Number(parsedValue);
      if (!isFinite(v) || v <= 0) { form.setError('value', { message: 'Enter a positive number for circumference in mm' }); return; }
      circumferenceMm = v;
      diameterMm = circumferenceMm / PI;
    } else if (unit === 'diameter' || unit === 'jp') {
      const v = Number(parsedValue);
      if (!isFinite(v) || v <= 0) { form.setError('value', { message: 'Enter a positive number for diameter in mm' }); return; }
      diameterMm = v;
      circumferenceMm = diameterMm * PI;
    } else if (unit === 'us') {
      const v = Number(parsedValue);
      if (!isFinite(v) || v <= 0) { form.setError('value', { message: 'Enter a positive numeric US size (e.g. 7 or 6.5)' }); return; }
      diameterMm = diameterFromUS(v);
      circumferenceMm = diameterMm * PI;
    } else if (unit === 'uk') {
      const letter = String(parsedValue).toUpperCase();
      const entry = STANDARD_RING_SIZES.find(s => s.UK === letter);
      if (!entry) { form.setError('value', { message: 'UK/India letter not recognized. Use F, G, H, etc.'}); return; }
      diameterMm = entry.dia;
      circumferenceMm = entry.circ;
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

  const parseValueAsNumberOrText = (val: string | null | undefined): string | number | null => {
    if (val === null || val === undefined) return null;
    const t = String(val).trim();
    if (t === '') return null;
    if (/[A-Za-z]/.test(t)) return t.toUpperCase();
    const num = Number(t.replace(',', '.'));
    return isNaN(num) ? t.toUpperCase() : num;
  }
  
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
                    <FormItem><FormLabel>Input Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="circumference">Circumference (mm) — EU</SelectItem>
                                <SelectItem value="diameter">Diameter (mm) — Japan</SelectItem>
                                <SelectItem value="us">US Size (number)</SelectItem>
                                <SelectItem value="uk">UK/India Size (letter)</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormItem>
                )} />
                <FormField control={form.control} name="value" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                        <FormLabel>Input Value</FormLabel>
                        <FormControl><Input placeholder="e.g. 54, 17.3, 7, O" {...field} value={field.value ?? ''} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>
            <div className="flex gap-2">
                <Button type="submit">Convert</Button>
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
                  <p className="text-sm text-muted-foreground">Regional Sizes</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div><strong>US:</strong> {result.resUS.toFixed(2)}</div>
                    <div><strong>UK / India:</strong> {result.resUK}</div>
                    <div><strong>EU (circ mm):</strong> {result.resEU}</div>
                    <div><strong>Japan (dia mm):</strong> {result.resJP}</div>
                  </div>
                </div>
                 <CardDescription className="mt-4 text-xs">Tip: For wider bands, consider going up half a size. Measure at the end of the day when fingers are warm for best fit.</CardDescription>
            </CardContent>
        </Card>
      )}
        
       <Accordion type="single" collapsible defaultValue="how-it-works" className="w-full">
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            This converter uses a standard international ring size chart as its base. It first converts your input into a standardized metric (inner circumference in mm). Then, using that standard measurement, it finds the closest matching sizes in all other regional systems, including interpolating for US sizes for greater accuracy.
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="space-y-4 prose prose-sm dark:prose-invert max-w-none">
        <h3>🧭 Complete Understanding of Ring Size Conversion</h3>
        <p className="text-xs">Finding the perfect ring size can be tricky. This guide explains how global ring sizes work (US, UK, EU, India, and Japan), how to measure your size at home, and how to use conversion charts confidently.</p>
        
        <h4><strong>🔹 What Is Ring Size?</strong></h4>
        <p className="text-xs">Your ring size is the inner circumference or diameter of a ring. Each country has its own system.</p>
        <Table>
            <TableHeader><TableRow><TableHead>Country</TableHead><TableHead>System</TableHead><TableHead>Measured As</TableHead></TableRow></TableHeader>
            <TableBody>
                <TableRow><TableCell>US</TableCell><TableCell>Numeric (e.g., 7, 8)</TableCell><TableCell>Internal diameter</TableCell></TableRow>
                <TableRow><TableCell>UK / India</TableCell><TableCell>Alphabetic (e.g., M, N)</TableCell><TableCell>Internal circumference</TableCell></TableRow>
                <TableRow><TableCell>EU</TableCell><TableCell>Numeric (e.g., 52, 54)</TableCell><TableCell>Circumference in mm</TableCell></TableRow>
                <TableRow><TableCell>Japan</TableCell><TableCell>Numeric (e.g., 14, 15)</TableCell><TableCell>Diameter in mm</TableCell></TableRow>
            </TableBody>
        </Table>

        <h4><strong>🔹 How to Measure Ring Size at Home</strong></h4>
        <p className="text-xs"><strong>Method 1: String or Paper:</strong> Wrap a string around your finger, mark where it overlaps, and measure the length in mm (this is your circumference).</p>
        <p className="text-xs"><strong>Method 2: Existing Ring:</strong> Measure the inner diameter of a ring that fits well and use the chart to find your size.</p>

        <h4><strong>🔹 Average Ring Sizes</strong></h4>
        <p className="text-xs">The average women’s ring size is US 6.5, and men’s is US 10.</p>

        <h4><strong>🔹 Common Mistakes to Avoid</strong></h4>
        <ul className="list-disc list-inside text-xs">
            <li>Measuring cold fingers (they shrink).</li>
            <li>Ignoring band width (wider rings fit tighter).</li>
            <li>Confusing diameter with circumference.</li>
        </ul>

        <h4><strong>💬 FAQs on Ring Size Conversion</strong></h4>
        <p className="text-xs"><strong>1. What is the difference between US and UK ring sizes?</strong><br/>US sizes use numbers (7), while UK/India use letters (N). A US 7 is a UK N.</p>
        <p className="text-xs"><strong>2. Are ring sizes unisex?</strong><br/>Yes, the measurement scale is the same for men and women.</p>

        <h4><strong>🔗 Related Calculators</strong></h4>
        <ul className="list-disc list-inside text-xs">
            <li><Link href="/category/conversions/shoe-size-converter" className="text-primary underline">Shoe Size Converter</Link></li>
            <li><Link href="/category/conversions/cloth-size-converter" className="text-primary underline">Clothing Size Converter</Link></li>
            <li><Link href="/category/conversions/hat-size-converter" className="text-primary underline">Hat Size Converter</Link></li>
        </ul>
        
        <h4><strong>📚 Final Thoughts</strong></h4>
        <p className="text-xs">Understanding how ring sizes translate across regions saves time and hassle. With accurate measurements and a reliable converter, you can shop for rings globally with confidence.</p>
      </div>
    </div>
  );
}

    