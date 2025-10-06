
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
        
      <Accordion type="single" collapsible defaultValue='how-it-works' className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This clothing size converter uses predefined data tables that map sizes across different international standards. When you select a gender, region, and size, it looks up the corresponding row in its database to find the equivalent sizes in all other regions. Since there's no single mathematical formula for clothing sizes due to variations in brand and fit, this mapping method provides a reliable, standardized conversion based on common industry charts.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="space-y-4 prose prose-sm dark:prose-invert max-w-none">
        <h3 className='font-bold'>🧢 Complete Understanding of Global Hat Size Conversion</h3>
        <h4 className='font-bold'>🧠 Why Hat Size Matters</h4>
        <p className="text-xs">Hats are more than just fashion accessories — they’re about comfort, confidence, and identity. Whether you’re buying a fedora, baseball cap, or sun hat, getting the right fit ensures the hat sits comfortably on your head, stays in place, and enhances your look.</p>
        <p className="text-xs">A hat that’s too tight can cause headaches and leave marks, while a loose one will slide or blow away easily. Knowing your exact hat size saves you from constant adjustments and poor fits.</p>
        
        <h4 className='font-bold'>📏 How to Measure Your Head for a Hat</h4>
        <p className="text-xs">The first step in finding your hat size is measuring your head circumference accurately. Here’s how you can do it at home:</p>
        <h5 className='font-bold text-xs'>Step-by-Step Measurement Guide</h5>
        <ol className="list-decimal list-inside text-xs">
          <li>Get a flexible measuring tape. If you don’t have one, use a piece of string and a ruler.</li>
          <li>Wrap the tape around your head. Place it just above your eyebrows and ears, where a hat would normally sit.</li>
          <li>Make sure it’s level all around and not too tight or loose.</li>
          <li>Note the measurement. Measure in centimeters (preferred globally) or inches (common in the US).</li>
          <li>Take it two or three times for accuracy.</li>
          <li>Find your size using a conversion chart (like below).</li>
        </ol>

        <h4 className='font-bold'>📊 Hat Size Conversion Chart</h4>
        <Table>
          <TableHeader><TableRow><TableHead>Head (cm)</TableHead><TableHead>Inches</TableHead><TableHead>US/UK</TableHead><TableHead>EU</TableHead><TableHead>General</TableHead></TableRow></TableHeader>
          <TableBody>
              <TableRow><TableCell>52</TableCell><TableCell>20.5</TableCell><TableCell>6 1/2</TableCell><TableCell>53</TableCell><TableCell>XS</TableCell></TableRow>
              <TableRow><TableCell>53</TableCell><TableCell>20.9</TableCell><TableCell>6 5/8</TableCell><TableCell>54</TableCell><TableCell>S</TableCell></TableRow>
              <TableRow><TableCell>54</TableCell><TableCell>21.3</TableCell><TableCell>6 3/4</TableCell><TableCell>55</TableCell><TableCell>S</TableCell></TableRow>
              <TableRow><TableCell>55</TableCell><TableCell>21.7</TableCell><TableCell>6 7/8</TableCell><TableCell>56</TableCell><TableCell>M</TableCell></TableRow>
              <TableRow><TableCell>56</TableCell><TableCell>22.0</TableCell><TableCell>7</TableCell><TableCell>57</TableCell><TableCell>M</TableCell></TableRow>
              <TableRow><TableCell>57</TableCell><TableCell>22.4</TableCell><TableCell>7 1/8</TableCell><TableCell>58</TableCell><TableCell>L</TableCell></TableRow>
              <TableRow><TableCell>58</TableCell><TableCell>22.8</TableCell><TableCell>7 1/4</TableCell><TableCell>59</TableCell><TableCell>L</TableCell></TableRow>
              <TableRow><TableCell>59</TableCell><TableCell>23.2</TableCell><TableCell>7 3/8</TableCell><TableCell>60</TableCell><TableCell>XL</TableCell></TableRow>
              <TableRow><TableCell>60</TableCell><TableCell>23.6</TableCell><TableCell>7 1/2</TableCell><TableCell>61</TableCell><TableCell>XL</TableCell></TableRow>
              <TableRow><TableCell>61</TableCell><TableCell>24.0</TableCell><TableCell>7 5/8</TableCell><TableCell>62</TableCell><TableCell>XXL</TableCell></TableRow>
              <TableRow><TableCell>62</TableCell><TableCell>24.4</TableCell><TableCell>7 3/4</TableCell><TableCell>63</TableCell><TableCell>XXL</TableCell></TableRow>
          </TableBody>
        </Table>
        <p className="text-xs">💡 Pro tip: If you’re between two sizes, always go for the larger one, especially for structured hats.</p>
        
        <h4 className='font-bold'>🔗 Related Calculators and Converters</h4>
        <ul className="list-disc list-inside text-xs">
            <li><Link href="/category/conversions/shoe-size-converter" className="text-primary underline">👟 Universal Shoe Size Converter</Link></li>
            <li><Link href="/category/conversions/cloth-size-converter" className="text-primary underline">👕 Universal Clothing Size Converter</Link></li>
            <li><Link href="/category/conversions/ring-size-converter" className="text-primary underline">💍 Ring Size Converter</Link></li>
            <li><Link href="/category/conversions/belt-size-converter" className="text-primary underline">Belt Size Converter</Link></li>
            <li><Link href="/category/conversions/glove-size-converter" className="text-primary underline">🧤 Glove Size Converter</Link></li>
        </ul>

      </div>
    </div>
  );
}
