
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

const hatSizeChart = [
    { cm: 54, in: "21.25", us: "6 3/4", eu: 54, jp: 55 },
    { cm: 55, in: "21.65", us: "6 7/8", eu: 55, jp: 56 },
    { cm: 56, in: "22.05", us: "7", eu: 56, jp: 57 },
    { cm: 57, in: "22.45", us: "7 1/8", eu: 57, jp: 58 },
    { cm: 58, in: "22.83", us: "7 1/4", eu: 58, jp: 59 },
    { cm: 59, in: "23.23", us: "7 3/8", eu: 59, jp: 60 },
    { cm: 60, in: "23.62", us: "7 1/2", eu: 60, jp: 61 },
    { cm: 61, in: "24.02", us: "7 5/8", eu: 61, jp: 62 },
    { cm: 62, in: "24.41", us: "7 3/4", eu: 62, jp: 63 },
];

// Function to convert decimal to fraction for US sizes
const toFraction = (decimal: number) => {
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

    if (k1 > 8) { // Simplify to nearest 1/8
        k1 = Math.round(fracDecimal * 8);
        h1 = 8;
        const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
        const divisor = gcd(k1,h1);
        return `${whole} ${k1/divisor}/${h1/divisor}`;
    }

    return `${whole} ${h1}/${k1}`;
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
      case "us": cm = value * Math.PI * 2.54; break; // Assumes US size is diameter in inches
      case "eu": cm = value; break; // EU size is often just cm
      case "jp": cm = value - 1; break; // Japan size is often cm + 1
    }

    const inches = cm / 2.54;
    const usDecimal = inches / Math.PI;
    const usFraction = toFraction(usDecimal);

    setResult({
      cm,
      in: inches,
      us: usFraction,
      eu: Math.round(cm),
      jp: Math.round(cm + 1),
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
                                <SelectItem value="jp">Japan Size</SelectItem>
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
                 <CardDescription className="mt-4 text-xs">Note: EU and India sizes usually correspond to head circumference in cm. If between sizes, choose the larger one.</CardDescription>
            </CardContent>
        </Card>
      )}

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-3">🧢 Standard Hat Size Chart</h2>
        <div className="overflow-x-auto">
            <Table>
                <TableHeader><TableRow><TableHead>Head (cm)</TableHead><TableHead>Head (in)</TableHead><TableHead>US / UK</TableHead><TableHead>EU / India</TableHead><TableHead>Japan</TableHead></TableRow></TableHeader>
                <TableBody>
                    {hatSizeChart.map(row => (
                        <TableRow key={row.cm}>
                            <TableCell>{row.cm}</TableCell>
                            <TableCell>{row.in}</TableCell>
                            <TableCell>{row.us}</TableCell>
                            <TableCell>{row.eu}</TableCell>
                            <TableCell>{row.jp}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
      </div>
    </div>
  );
}
