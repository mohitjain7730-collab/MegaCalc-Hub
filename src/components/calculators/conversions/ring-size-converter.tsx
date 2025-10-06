
'use client';

import { useState, useEffect } from 'react';
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
  inputType: z.enum(['circumference', 'diameter', 'us', 'uk', 'eu', 'jp']),
  inputValue: z.string().min(1, 'Please enter a value.'),
});

type FormValues = z.infer<typeof formSchema>;
type Result = {
    diameter: number;
    circumference: number;
    closestStandard: string;
    closestDiff: number;
    resUS: number;
    resUK: string;
    resEU: number;
    resJP: number;
}

export default function RingSizeConverter() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inputType: 'circumference',
      inputValue: '',
    },
  });

  const clearAll = () => {
      form.reset();
      setResult(null);
  }
  
  const example = () => {
    form.setValue('inputType', 'us');
    form.setValue('inputValue', '7');
    form.handleSubmit(onSubmit)();
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
  
  const parseValueAsNumberOrText = (val: string | null | undefined): string | number | null => {
    if (val === null || val === undefined) return null;
    const t = String(val).trim();
    if (t === '') return null;
    if (/[A-Za-z]/.test(t)) return t.toUpperCase();
    const num = Number(t.replace(',', '.'));
    return isNaN(num) ? t.toUpperCase() : num;
  }

  const onSubmit = (values: FormValues) => {
    const { inputType, inputValue } = values;
    const parsed = parseValueAsNumberOrText(inputValue);
    let diameterMm = NaN;
    let circumferenceMm = NaN;
    const PI = Math.PI;

    if (inputType === 'circumference' || inputType === 'eu') {
      const v = Number(parsed);
      if (!isFinite(v) || v <= 0) { form.setError('inputValue', { message: 'Enter a positive number for circumference in mm' }); return; }
      circumferenceMm = v;
      diameterMm = circumferenceMm / PI;
    } else if (inputType === 'diameter' || inputType === 'jp') {
      const v = Number(parsed);
      if (!isFinite(v) || v <= 0) { form.setError('inputValue', { message: 'Enter a positive number for diameter in mm' }); return; }
      diameterMm = v;
      circumferenceMm = diameterMm * PI;
    } else if (inputType === 'us') {
      const v = Number(parsed);
      if (!isFinite(v) || v <= 0) { form.setError('inputValue', { message: 'Enter a positive numeric US size (e.g. 7 or 6.5)' }); return; }
      diameterMm = diameterFromUS(v);
      circumferenceMm = diameterMm * PI;
    } else if (inputType === 'uk') {
      const letter = String(parsed).toUpperCase();
      const entry = STANDARD_RING_SIZES.find(s => s.UK === letter);
      if (!entry) { form.setError('inputValue', { message: 'UK/India letter not recognized. Use letters like F, G, H...Z' }); return; }
      diameterMm = entry.dia;
      circumferenceMm = entry.circ;
    }

    if(isNaN(diameterMm)) {
        form.setError('inputValue', {message: 'Invalid input for selected type.'});
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
    
    // Clear errors if submission is successful
    form.clearErrors();
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>
            Convert ring sizes across <strong>US, UK (letter), EU (circumference mm), India (UK letters), and Japan (diameter mm)</strong>. Enter any supported input and click Convert.
          </CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="inputType" render={({ field }) => (
              <FormItem><FormLabel>Input Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="circumference">Circumference (mm) — EU</SelectItem>
                    <SelectItem value="diameter">Diameter (mm) — Japan</SelectItem>
                    <SelectItem value="us">US Size (number, e.g. 7 or 6.5)</SelectItem>
                    <SelectItem value="uk">UK/India Size (letter, e.g. O or M)</SelectItem>
                  </SelectContent>
              </Select></FormItem>
            )} />
            <div className="md:col-span-2">
              <FormField control={form.control} name="inputValue" render={({ field }) => (
                <FormItem><FormLabel>Input Value</FormLabel><FormControl><Input placeholder="e.g. 54, 17.3, 7, O" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
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
          <CardHeader><CardTitle>Results</CardTitle></CardHeader>
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

      <hr />

      <div>
        <h3 className="text-xl font-semibold mb-3">Ring Size Reference Table</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow>
                <TableHead>US</TableHead>
                <TableHead>UK / India</TableHead>
                <TableHead>Diameter (mm)</TableHead>
                <TableHead>Circumference (mm)</TableHead>
                <TableHead>EU</TableHead>
                <TableHead>Japan</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {STANDARD_RING_SIZES.map(s => (
                <TableRow key={s.US}>
                  <TableCell>{s.US}</TableCell>
                  <TableCell>{s.UK}</TableCell>
                  <TableCell>{s.dia.toFixed(1)}</TableCell>
                  <TableCell>{s.circ.toFixed(1)}</TableCell>
                  <TableCell>{s.EU}</TableCell>
                  <TableCell>{s.JP}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
