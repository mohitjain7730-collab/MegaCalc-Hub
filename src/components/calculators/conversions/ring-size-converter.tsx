
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
      if (!isFinite(v) || v <= 0) { alert('Enter a positive number for diameter in mm'); return; }
      diameterMm = v;
      circumferenceMm = diameterMm * PI;
    } else if (unit === 'us') {
      const v = Number(parsedValue);
      if (!isFinite(v) || v <= 0) { alert('Enter a positive numeric US size (e.g. 7 or 6.5)'); return; }
      diameterMm = diameterFromUS(v);
      circumferenceMm = diameterMm * PI;
    } else if (unit === 'uk') {
      const letter = String(parsedValue).toUpperCase();
      const entry = STANDARD_RING_SIZES.find(s => s.UK === letter);
      if (!entry) { alert('UK/India letter not recognized. Use letters like F, G, H, I, J, K, L, M ... Z'); return; }
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
                    <div className="p-3 border rounded"><p className="text-sm text-muted-foreground">Inner Diameter</p><p className="font-semibold text-lg">{result.diameter.toFixed(2)} mm</p></div>
                    <div className="p-3 border rounded"><p className="text-sm text-muted-foreground">Inner Circumference</p><p className="font-semibold text-lg">{result.circumference.toFixed(1)} mm</p></div>
                    <div className="p-3 border rounded"><p className="text-sm text-muted-foreground">Closest Standard</p><p className="font-semibold text-lg">{result.closestStandard}</p><CardDescription className="text-xs">Diff: {result.closestDiff.toFixed(1)} mm</CardDescription></div>
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
        
      <Accordion type="single" collapsible defaultValue='how-it-works' className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This converter uses a standard international ring size chart as its base. It first converts your input into a standardized metric (inner circumference in mm). Then, using that standard measurement, it finds the closest matching sizes in all other regional systems, including interpolating for US sizes for greater accuracy.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="space-y-4 prose prose-sm dark:prose-invert max-w-none">
        <h3 className='font-bold text-lg'>🧭 Complete Understanding of Ring Size Conversion (US, UK, EU, India & Japan)</h3>
        <p className="text-sm">Finding the perfect ring size can be surprisingly tricky — what fits perfectly in one country might feel loose or tight in another. That’s why having a ring size converter is essential when buying or gifting jewelry internationally.</p>
        <p className="text-sm">In this guide, we’ll walk you through everything you need to know about ring size measurement, conversion between US, UK, EU, India, and Japan, and how to measure your ring size at home — with clear charts, formulas, and tips.</p>
        
        <h4 className='font-bold'>🔹 What Is Ring Size?</h4>
        <p className="text-sm">Your ring size represents the inner circumference or diameter of a ring that fits comfortably on your finger. Each country follows its own measurement system — for example:</p>
        <Table>
            <TableHeader><TableRow><TableHead>Country</TableHead><TableHead>System</TableHead><TableHead>Measured As</TableHead></TableRow></TableHeader>
            <TableBody>
                <TableRow><TableCell>US</TableCell><TableCell>Numeric (e.g., 7, 8, 9)</TableCell><TableCell>Internal diameter in mm</TableCell></TableRow>
                <TableRow><TableCell>UK / India</TableCell><TableCell>Alphabetic (e.g., M, N, O)</TableCell><TableCell>Internal circumference in mm</TableCell></TableRow>
                <TableRow><TableCell>EU</TableCell><TableCell>Numeric (e.g., 52, 54, 56)</TableCell><TableCell>Circumference in mm</TableCell></TableRow>
                <TableRow><TableCell>Japan</TableCell><TableCell>Numeric (e.g., 14, 15)</TableCell><TableCell>Diameter in mm</TableCell></TableRow>
            </TableBody>
        </Table>

        <h4 className='font-bold'>🔹 Formula to Convert Between Diameter and Circumference</h4>
        <p className="text-sm">The fundamental relation is simple: Circumference (mm) = π × Diameter (mm). So, Diameter (mm) = Circumference (mm) / π. <br/> Example: If the inner diameter is 17.3 mm, Circumference = 17.3 × 3.1416 = 54.4 mm (EU size 54).</p>

        <h4 className='font-bold'>🔹 Understanding Regional Systems</h4>
        <p className="text-sm">US Ring Sizes use numbers from 3 to 13. Each half-size increases circumference by ~0.8 mm. UK and India Ring Sizes use letters (A-Z), each representing ~1 mm change in circumference. EU Ring Sizes directly use circumference in mm. Japan Ring Sizes use diameter in mm.</p>

        <h4 className='font-bold'>🔹 Ring Size Conversion Chart</h4>
        <Table>
          <TableHeader><TableRow><TableHead>US</TableHead><TableHead>UK/India</TableHead><TableHead>Diameter (mm)</TableHead><TableHead>Circumference (mm)</TableHead><TableHead>EU</TableHead><TableHead>Japan</TableHead></TableRow></TableHeader>
          <TableBody>
            <TableRow><TableCell>5</TableCell><TableCell>J</TableCell><TableCell>15.7</TableCell><TableCell>49.3</TableCell><TableCell>50</TableCell><TableCell>9</TableCell></TableRow>
            <TableRow><TableCell>6</TableCell><TableCell>L</TableCell><TableCell>16.5</TableCell><TableCell>51.8</TableCell><TableCell>52</TableCell><TableCell>12</TableCell></TableRow>
            <TableRow><TableCell>7</TableCell><TableCell>N</TableCell><TableCell>17.3</TableCell><TableCell>54.4</TableCell><TableCell>54</TableCell><TableCell>14</TableCell></TableRow>
            <TableRow><TableCell>8</TableCell><TableCell>P</TableCell><TableCell>18.1</TableCell><TableCell>57.0</TableCell><TableCell>56</TableCell><TableCell>16</TableCell></TableRow>
            <TableRow><TableCell>9</TableCell><TableCell>R</TableCell><TableCell>18.9</TableCell><TableCell>59.5</TableCell><TableCell>59</TableCell><TableCell>18</TableCell></TableRow>
            <TableRow><TableCell>10</TableCell><TableCell>T</TableCell><TableCell>19.8</TableCell><TableCell>62.1</TableCell><TableCell>63</TableCell><TableCell>20</TableCell></TableRow>
            <TableRow><TableCell>11</TableCell><TableCell>V</TableCell><TableCell>20.6</TableCell><TableCell>64.6</TableCell><TableCell>66</TableCell><TableCell>23</TableCell></TableRow>
            <TableRow><TableCell>12</TableCell><TableCell>X</TableCell><TableCell>21.4</TableCell><TableCell>67.2</TableCell><TableCell>68</TableCell><TableCell>27</TableCell></TableRow>
            <TableRow><TableCell>13</TableCell><TableCell>Z</TableCell><TableCell>21.8</TableCell><TableCell>68.5</TableCell><TableCell>70</TableCell><TableCell>28</TableCell></TableRow>
          </TableBody>
        </Table>
        <p className="text-xs">✅ Tip: For wider bands or thicker rings, go up half a size for comfort.</p>

        <h4 className='font-bold'>🔹 How to Measure Ring Size at Home</h4>
        <p className="text-sm">You can find your perfect ring size using just a piece of string, paper, or an existing ring.</p>
        <p className="text-sm"><strong>Method 1: Using a String or Paper Strip</strong><br/>Wrap a string or strip of paper around the base of your finger. Mark where it overlaps. Measure the length in millimeters — this is your circumference. Use the chart above to find your corresponding US or UK size.</p>
        <p className="text-sm"><strong>Method 2: Using an Existing Ring</strong><br/>Take a ring that fits perfectly. Measure the inner diameter in millimeters. Match the diameter in the table to find your equivalent ring size.</p>
        <p className="text-sm"><strong>Method 3: Using Online Ring Size Converter</strong><br/>The easiest way is to use the online Ring Size Converter (like the one above 👆). Just enter any known size (US/UK/EU/India/Japan) or diameter/circumference in mm, and it instantly gives you all regional equivalents.</p>

        <h4 className='font-bold'>🔹 Average Ring Sizes (for Reference)</h4>
        <Table>
          <TableHeader><TableRow><TableHead>Category</TableHead><TableHead>Common Sizes</TableHead></TableRow></TableHeader>
          <TableBody>
            <TableRow><TableCell>Women (India/US)</TableCell><TableCell>US 5 to 7.5 (UK J½ to O)</TableCell></TableRow>
            <TableRow><TableCell>Men (India/US)</TableCell><TableCell>US 8.5 to 11 (UK Q½ to V½)</TableCell></TableRow>
          </TableBody>
        </Table>
        <p className="text-xs">💡 Fun fact: The average women’s ring size globally is US 6.5, and men’s is US 10.</p>

        <h4 className='font-bold'>🔹 Common Mistakes to Avoid</h4>
        <ul className="list-disc list-inside text-sm pl-4">
            <li>Measuring cold fingers: Fingers shrink when cold — measure at the end of the day when they’re warm.</li>
            <li>Ignoring band width: Wider rings fit tighter; go half a size up.</li>
            <li>Using non-flat string: Thick string or tape can give inaccurate results.</li>
            <li>Confusing diameter with circumference: Always double-check which one you’re using.</li>
            <li>Forgetting finger dominance: Dominant hand fingers are slightly larger (0.25–0.5 size difference).</li>
        </ul>

        <h4 className='font-bold'>🔹 FAQs on Ring Size Conversion</h4>
        <p className="text-sm"><strong>1. What is the difference between US and UK ring sizes?</strong><br/>US sizes use numbers (like 7), while UK and India use letters (like O). US 7 = UK N = 17.3 mm diameter.</p>
        <p className="text-sm"><strong>2. What is the easiest way to find your ring size?</strong><br/>Use a ring size converter tool or measure your ring’s diameter with a ruler and compare it with a ring size chart.</p>
        <p className="text-sm"><strong>3. Are ring sizes unisex?</strong><br/>Yes. Both men and women use the same measurement scales; only the average range differs.</p>
        <p className="text-sm"><strong>4. Is there a difference between men’s and women’s ring sizes in India?</strong><br/>No — the sizing system is the same (UK letters). Men usually fall between R–V, and women between J–O.</p>
        <p className="text-sm"><strong>5. How accurate is online ring size conversion?</strong><br/>Highly accurate if the entered diameter or circumference is measured precisely (±0.2 mm).</p>
        
        <h4 className='font-bold'>🔹 SEO-Rich Quick Facts (For Featured Snippets)</h4>
        <ul className="list-disc list-inside text-sm pl-4">
            <li>1 US ring size = ~0.32 mm diameter increase.</li>
            <li>1 full US size ≈ 2.55 mm increase in circumference.</li>
            <li>1 UK size letter ≈ 1 mm difference in circumference.</li>
            <li>Conversion formula: EU = Circumference in mm = π × Diameter (mm).</li>
            <li>India = UK ring size chart (same letters).</li>
        </ul>

        <h4 className='font-bold'>🔹 Choosing the Right Fit (Expert Tips)</h4>
        <ul className="list-disc list-inside text-sm pl-4">
            <li>Always measure the finger you’ll wear the ring on (left vs. right can differ).</li>
            <li>If your size is between two, always round up for comfort.</li>
            <li>For engagement rings, measure when the finger is neither too cold nor too hot.</li>
            <li>Avoid measuring after workouts, showers, or eating salty food — fingers may swell.</li>
        </ul>

        <h4 className='font-bold'>🔹 Summary</h4>
        <Table>
          <TableHeader><TableRow><TableHead>Conversion Formula</TableHead><TableHead>Example</TableHead></TableRow></TableHeader>
          <TableBody>
            <TableRow><TableCell>Circumference = π × Diameter</TableCell><TableCell>17 mm × 3.1416 = 53.4 mm</TableCell></TableRow>
            <TableRow><TableCell>Diameter = Circumference / π</TableCell><TableCell>54.4 mm / 3.1416 = 17.3 mm</TableCell></TableRow>
            <TableRow><TableCell>EU size = Circumference (mm)</TableCell><TableCell>54.4 → EU 54</TableCell></TableRow>
            <TableRow><TableCell>Japan = Diameter (mm) rounded</TableCell><TableCell>17.3 → JP 17</TableCell></TableRow>
          </TableBody>
        </Table>

        <p className="text-sm">Whether you’re buying an engagement ring online or a gift from another country, this Ring Size Converter helps ensure a perfect fit — every time.</p>
        <p className="text-sm">Use the calculator above to instantly find your exact equivalent ring size across US, UK, EU, India, and Japan — no guesswork, no resizing hassles!</p>
      </div>
    </div>
  );
}
