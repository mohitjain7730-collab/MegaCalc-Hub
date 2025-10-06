
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Ruler } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const formSchema = z.object({
  footLength: z.number().positive(),
  unit: z.enum(['cm', 'inch']),
});

type FormValues = z.infer<typeof formSchema>;

interface Result {
    usMen: number;
    usWomen: number;
    uk: number;
    eu: number;
    jp: number;
    india: number;
}

export default function FootLengthToShoeSizeConverter() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      footLength: undefined,
      unit: 'cm',
    },
  });

  const onSubmit = (values: FormValues) => {
    let length = values.footLength;
    if (values.unit === 'inch') {
      length *= 2.54; // Convert inches to cm
    }

    // Shoe size calculations (approximate formulas based on common conventions)
    const usMen = Math.round(((length * 0.3937 * 3) - 22) + 0.5);
    const usWomen = usMen + 1.5;
    const uk = Math.round(usMen - 1);
    const eu = Math.round(length * 1.5 + 17);
    const jp = Math.round(length);
    const india = Math.round(uk);


    setResult({ usMen, usWomen, uk, eu, jp, india });
  };
  
  const unit = form.watch('unit');
  
  const sizeChartData = [
      { footLength: 22.0, usMen: 4, usWomen: 5.5, uk: 3, eu: 35, jp: 22, india: 21 },
      { footLength: 23.0, usMen: 5, usWomen: 6.5, uk: 4, eu: 36, jp: 23, india: 22 },
      { footLength: 24.0, usMen: 6, usWomen: 7.5, uk: 5, eu: 37, jp: 24, india: 23 },
      { footLength: 25.0, usMen: 7, usWomen: 8.5, uk: 6, eu: 38, jp: 25, india: 24 },
      { footLength: 26.0, usMen: 8, usWomen: 9.5, uk: 7, eu: 39, jp: 26, india: 25 },
      { footLength: 27.0, usMen: 9, usWomen: 10.5, uk: 8, eu: 40, jp: 27, india: 26 },
      { footLength: 28.0, usMen: 10, usWomen: 11.5, uk: 9, eu: 41, jp: 28, india: 27 },
      { footLength: 29.0, usMen: 11, usWomen: 12.5, uk: 10, eu: 42, jp: 29, india: 28 },
      { footLength: 30.0, usMen: 12, usWomen: 13.5, uk: 11, eu: 43, jp: 30, india: 29 },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CardDescription>
              Enter your foot length to get an estimation of your shoe size in various international systems.
            </CardDescription>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="footLength"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Foot Length ({unit})</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} placeholder="e.g., 25" step="0.1" value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Unit</FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="cm">Centimeters (cm)</SelectItem>
                                <SelectItem value="inch">Inches</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>
          <Button type="submit">Convert</Button>
        </form>
      </Form>

      {result && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Ruler className="h-8 w-8 text-primary" />
              <CardTitle>Estimated Shoe Sizes</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className='mb-4'>Based on a foot length of {form.getValues('unit') === 'cm' ? form.getValues('footLength') : (form.getValues('footLength') * 2.54).toFixed(1)} cm</CardDescription>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div className="p-3 border rounded-lg"><p className="font-semibold">US Men</p><p className="text-xl font-bold">{result.usMen}</p></div>
              <div className="p-3 border rounded-lg"><p className="font-semibold">US Women</p><p className="text-xl font-bold">{result.usWomen}</p></div>
              <div className="p-3 border rounded-lg"><p className="font-semibold">UK</p><p className="text-xl font-bold">{result.uk}</p></div>
              <div className="p-3 border rounded-lg"><p className="font-semibold">EU</p><p className="text-xl font-bold">{result.eu}</p></div>
              <div className="p-3 border rounded-lg"><p className="font-semibold">Japan</p><p className="text-xl font-bold">{result.jp}</p></div>
              <div className="p-3 border rounded-lg"><p className="font-semibold">India</p><p className="text-xl font-bold">{result.india}</p></div>
            </div>
             <CardDescription className="mt-4 text-xs">Note: These are estimations. Shoe sizes can vary significantly by brand and style. Always refer to a brand's specific sizing chart when possible.</CardDescription>
          </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator converts your foot length into various international shoe sizes using approximate, commonly-used formulas. It first ensures the foot length is in centimeters, then applies different linear conversions to estimate the size for each region's system (US, UK, EU, etc.).</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="space-y-4 prose prose-sm dark:prose-invert max-w-none">
        <h3 className='font-bold text-xl'>Foot Length to Shoe Size Converter: Your Complete Guide for US, UK, EU, Japan, and India Sizes</h3>
        <p className="text-xs">Finding the right shoe size can be confusing, especially when buying shoes online or from international brands. Different countries have different sizing standards, and even the same brand can vary slightly. That’s why a foot length to shoe size converter is an essential tool for anyone looking to buy the perfect-fitting shoes.</p>
        <p className="text-xs">This guide explains how to measure your foot accurately, convert it to US, UK, EU, Japan, and India sizes, and offers tips for selecting shoes that fit comfortably.</p>
        
        <h4 className='font-bold'>Why Knowing Your Foot Length Matters</h4>
        <p className="text-xs">Many people buy shoes based on their typical size without measuring their foot length. This can lead to:</p>
        <ul className="list-disc list-inside text-xs pl-4 space-y-1">
          <li>Shoes that are too tight or too loose.</li>
          <li>Discomfort, blisters, and foot pain.</li>
          <li>Poor performance for sports shoes.</li>
          <li>Increased likelihood of returns when shopping online.</li>
        </ul>
        <p className="text-xs">Using a foot length to shoe size converter ensures that you select a shoe that fits properly, giving you comfort and style.</p>

        <h4 className='font-bold'>How Shoe Sizes Work Across Different Regions</h4>
        <p className="text-xs">Shoe sizes vary from region to region:</p>
        <ul className="list-disc list-inside text-xs pl-4 space-y-1">
          <li><strong>US Sizes:</strong> Typically measured in inches; US Men and Women have slightly different scales.</li>
          <li><strong>UK Sizes:</strong> Similar to US sizing but usually 1 size smaller than US Men.</li>
          <li><strong>EU Sizes:</strong> Measured in centimeters, often used across Europe.</li>
          <li><strong>Japan Sizes:</strong> Directly corresponds to foot length in centimeters.</li>
          <li><strong>India Sizes:</strong> Often similar to EU sizes minus 14 (approximate).</li>
        </ul>
        <p className="text-xs">A converter simplifies all these differences, letting you find your size in any region instantly.</p>

        <h4 className='font-bold'>How to Measure Your Foot Length</h4>
        <p className="text-xs">Accurate measurement is crucial for the correct shoe size:</p>
        <ol className="list-decimal list-inside text-xs pl-4 space-y-1">
          <li><strong>Prepare:</strong> Use a soft measuring tape or a ruler. Place your foot on a piece of paper.</li>
          <li><strong>Mark the Length:</strong> Stand upright and mark the tip of your longest toe and the back of your heel.</li>
          <li><strong>Measure:</strong> Use a ruler to measure the distance between the two points. This is your foot length.</li>
          <li><strong>Record the Measurement:</strong> Use centimeters or inches, depending on your preference.</li>
        </ol>

        <h4 className='font-bold'>Using a Foot Length to Shoe Size Converter</h4>
        <p className="text-xs">A converter simplifies the process:</p>
        <ol className="list-decimal list-inside text-xs pl-4 space-y-1">
          <li>Enter your foot length in centimeters or inches.</li>
          <li>Select the unit of measurement.</li>
          <li>The tool instantly provides your US Men, US Women, UK, EU, Japan, and India sizes.</li>
        </ol>
        <p className="text-xs">This method eliminates guesswork and ensures a perfect fit every time.</p>
        
        <h4 className='font-bold'>Approximate Shoe Size Chart</h4>
        <p className="text-xs">Here’s a reference chart based on foot length in centimeters:</p>
        <Table>
            <TableHeader><TableRow><TableHead>Foot Length (cm)</TableHead><TableHead>US Men</TableHead><TableHead>US Women</TableHead><TableHead>UK</TableHead><TableHead>EU</TableHead><TableHead>Japan</TableHead><TableHead>India</TableHead></TableRow></TableHeader>
            <TableBody>
                {sizeChartData.map(row => (
                    <TableRow key={row.footLength}>
                        <TableCell>{row.footLength}</TableCell>
                        <TableCell>{row.usMen}</TableCell>
                        <TableCell>{row.usWomen}</TableCell>
                        <TableCell>{row.uk}</TableCell>
                        <TableCell>{row.eu}</TableCell>
                        <TableCell>{row.jp}</TableCell>
                        <TableCell>{row.india}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
        <p className="text-xs">Note: These sizes are approximate and may vary by brand or style. Always check brand-specific size charts when possible.</p>

        <h4 className='font-bold'>Tips for Choosing the Right Shoe Size</h4>
        <ul className="list-disc list-inside text-xs pl-4 space-y-1">
          <li><strong>Measure Both Feet:</strong> One foot is often slightly larger. Use the bigger foot as reference.</li>
          <li><strong>Consider Sock Thickness:</strong> If you wear thick socks, choose a slightly larger size.</li>
          <li><strong>Allow for Toe Movement:</strong> Your toes should have enough space to move comfortably.</li>
          <li><strong>Check Brand Size Charts:</strong> Each brand may have slight differences in sizing.</li>
          <li><strong>Use a Converter for International Brands:</strong> Converting foot length to multiple region sizes ensures a better fit.</li>
        </ul>
        
        <h4 className='font-bold'>Common Mistakes to Avoid</h4>
        <ul className="list-disc list-inside text-xs pl-4 space-y-1">
          <li><strong>Buying based on your usual size:</strong> Don’t assume your normal size fits every brand.</li>
          <li><strong>Ignoring foot width:</strong> Some shoes are narrow or wide. Consider width along with length.</li>
          <li><strong>Skipping measurement:</strong> Measuring only once a year is recommended to adjust for foot changes.</li>
          <li><strong>Buying shoes without trying:</strong> Especially for online shopping, use a converter first.</li>
        </ul>

        <h4 className='font-bold'>Benefits of Using a Foot Length to Shoe Size Converter</h4>
        <ul className="list-disc list-inside text-xs pl-4 space-y-1">
            <li>Quick and accurate calculation of shoe sizes across US, UK, EU, Japan, and India.</li>
            <li>Reduces returns and exchanges due to incorrect sizing.</li>
            <li>Ensures comfort and foot health.</li>
            <li>Ideal for online shopping or international purchases.</li>
        </ul>

        <h4 className='font-bold'>Foot Length and Shoe Comfort</h4>
        <p className="text-xs">Properly fitting shoes:</p>
        <ul className="list-disc list-inside text-xs pl-4 space-y-1">
          <li>Reduce risk of blisters and injuries.</li>
          <li>Enhance performance for running, hiking, or sports.</li>
          <li>Improve posture and walking comfort.</li>
        </ul>

        <h4 className='font-bold'>FAQ: Foot Length to Shoe Size</h4>
        <p className="text-xs"><strong>Q1: Can I use the same size for men and women?</strong><br/>Not exactly. US Men and US Women sizes differ by approximately 1.5 sizes. Always use a converter.</p>
        <p className="text-xs"><strong>Q2: What if my foot is between sizes?</strong><br/>Choose the larger size for comfort, especially for closed-toe shoes.</p>
        <p className="text-xs"><strong>Q3: Does foot length change over time?</strong><br/>Yes, foot length can increase slightly with age or weight changes. Measure periodically.</p>
        <p className="text-xs"><strong>Q4: Are India sizes reliable?</strong><br/>India sizes are approximate but generally align with EU sizes minus 14. Using a converter ensures accuracy.</p>

        <h4 className='font-bold'>Conclusion</h4>
        <p className="text-xs">Measuring your foot length and using a foot length to shoe size converter is the smartest way to ensure perfectly fitting shoes. With your measurement, you can quickly determine US, UK, EU, Japan, and India sizes, making online and international shopping hassle-free.</p>
        <p className="text-xs">Whether you’re buying sneakers, formal shoes, or sandals, a proper fit improves comfort, prevents foot problems, and makes every step more enjoyable. Always measure your feet, check size charts, and use a reliable converter to choose the right size for your lifestyle.</p>

        <h4 className='font-bold'>🔗 Related Calculators</h4>
        <ul className="list-disc list-inside text-xs space-y-1 pl-4">
            <li><Link href="/category/conversions/cloth-size-converter" className="text-primary underline">Universal Clothing Size Converter</Link></li>
            <li><Link href="/category/conversions/ring-size-converter" className="text-primary underline">Ring Size Converter</Link></li>
            <li><Link href="/category/conversions/hat-size-converter" className="text-primary underline">Hat Size Converter</Link></li>
        </ul>
      </div>
    </div>
  );
}
