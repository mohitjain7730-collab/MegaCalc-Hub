
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
  value: z.coerce.number().positive(),
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
    if (denominator > 8) {
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
    
    const parsedValue = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
    if (isNaN(parsedValue)) {
      form.setError('value', { message: 'Please enter a valid number.' });
      return;
    }

    let cm = 0;

    switch (unit) {
      case "cm": cm = parsedValue; break;
      case "in": cm = parsedValue * 2.54; break;
      case "us": cm = parsedValue * Math.PI * 2.54; break;
      case "eu": cm = parsedValue; break;
      case "jp": cm = parsedValue; break;
    }

    const inches = cm / 2.54;
    const usDecimal = inches / Math.PI;

    setResult({
      cm,
      in: inches,
      us: toFraction(usDecimal),
      eu: Math.round(cm),
      jp: Math.round(cm + 1),
    });
  };

  const clearAll = () => {
    form.reset();
    setResult(null);
  }
  
  const example = () => {
    form.setValue('unit', 'us');
    form.setValue('value', 7.25);
    form.handleSubmit(onSubmit)();
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CardDescription>
                Convert your head circumference between cm, inches, and regional hat sizes (US, UK, EU, India, Japan).
            </CardDescription>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="unit" render={({ field }) => (
                    <FormItem><FormLabel>Input Type</FormLabel>
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
            <div className="flex gap-2">
                <Button type="submit">Convert</Button>
                <Button type="button" variant="secondary" onClick={example}>Example: US 7 1/4</Button>
                <Button type="button" variant="destructive" className="ml-auto" onClick={clearAll}>Clear</Button>
            </div>
        </form>
      </Form>
      
      {result && (
        <Card id="result" className="mt-6">
            <CardHeader><div className='flex items-center gap-4'><Ruler className="h-8 w-8 text-primary" /><CardTitle>Converted Sizes</CardTitle></div></CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div className="p-3 border rounded"><p className="text-gray-500">Centimeters (cm)</p><p className="font-semibold text-lg">{result.cm.toFixed(1)}</p></div>
                    <div className="p-3 border rounded"><p className="text-gray-500">Inches (in)</p><p className="font-semibold text-lg">{result.in.toFixed(2)}</p></div>
                    <div className="p-3 border rounded"><p className="text-gray-500">US / UK Size</p><p className="font-semibold text-lg">{result.us}</p></div>
                    <div className="p-3 border rounded"><p className="text-gray-500">EU / India Size</p><p className="font-semibold text-lg">{result.eu}</p></div>
                    <div className="p-3 border rounded"><p className="font-semibold text-lg">Japan Size</p><p className="font-semibold text-lg">{result.jp}</p></div>
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
        <h3 className='font-bold text-lg'>The Ultimate Guide to Hat Sizes: Find Your Perfect Fit in US, UK, EU, India & Japan</h3>
        <p className="text-sm">Hats are more than just fashion accessories — they’re about comfort, confidence, and identity. Whether you’re buying a fedora, baseball cap, or sun hat, getting the right fit ensures the hat sits comfortably on your head, stays in place, and enhances your look.</p>
        <p className="text-sm">A hat that’s too tight can cause headaches and leave marks, while a loose one will slide or blow away easily. Knowing your exact hat size saves you from constant adjustments and poor fits.</p>
        
        <h4 className='font-bold'>How to Measure Your Head for a Hat</h4>
        <p className="text-sm">The first step in finding your hat size is measuring your head circumference accurately. Here’s how you can do it at home:</p>
        <ol className="list-decimal list-inside text-sm space-y-1 pl-4">
          <li>Get a flexible measuring tape. If you don’t have one, use a piece of string and a ruler.</li>
          <li>Wrap the tape around your head, placing it just above your eyebrows and ears, where a hat would normally sit.</li>
          <li>Make sure it’s level all around and not too tight or loose.</li>
          <li>Note the measurement in either centimeters or inches.</li>
          <li>Take it two or three times for accuracy.</li>
          <li>Find your size using a conversion chart (like below).</li>
        </ol>

        <h4 className='font-bold'>Hat Size Conversion Chart</h4>
        <Table>
          <TableHeader><TableRow><TableHead>Head (cm)</TableHead><TableHead>Inches</TableHead><TableHead>US/UK</TableHead><TableHead>EU/India</TableHead><TableHead>General</TableHead></TableRow></TableHeader>
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
        
        <h4 className='font-bold'>Regional Hat Sizing Systems</h4>
        <ul className="list-disc list-inside text-sm pl-4">
            <li><strong>🇺🇸 US / 🇬🇧 UK Hat Sizes:</strong> Expressed as fractions of head circumference in inches divided by π (3.14).</li>
            <li><strong>🇪🇺 European Hat Sizes:</strong> Based directly on head circumference in centimeters.</li>
            <li><strong>🇮🇳 Indian Hat Sizes:</strong> Typically align with European sizes, measured in cm.</li>
            <li><strong>🌏 International Sizes (Label System):</strong> Uses XS to XXL for general categorization.</li>
        </ul>
        
        <h4 className='font-bold'>🔗 Related Calculators</h4>
        <ul className="list-disc list-inside text-sm space-y-1 pl-4">
            <li><Link href="/category/conversions/shoe-size-converter" className="text-primary underline">👟 Universal Shoe Size Converter</Link></li>
            <li><Link href="/category/conversions/cloth-size-converter" className="text-primary underline">👕 Universal Clothing Size Converter</Link></li>
            <li><Link href="/category/conversions/ring-size-converter" className="text-primary underline">💍 Ring Size Converter</Link></li>
            <li><Link href="/category/conversions/belt-size-converter" className="text-primary underline">👖 Belt Size Converter</Link></li>
        </ul>
      </div>
    </div>
  );
}
