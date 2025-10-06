
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
import { Hand } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const formSchema = z.object({
  handCircumference: z.number().positive(),
  unit: z.enum(['inch', 'cm']),
});

type FormValues = z.infer<typeof formSchema>;

interface Result {
    usUk: number;
    eu: number;
    japan: number;
    india: number;
}

export default function GloveSizeConverter() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      handCircumference: undefined,
      unit: 'inch',
    },
  });

  const onSubmit = (values: FormValues) => {
    let handInInches = values.handCircumference;
    if (values.unit === "cm") {
      handInInches = values.handCircumference / 2.54;
    }

    const usUkSize = Math.round(handInInches * 2) / 2;
    const euSize = Math.round(handInInches * 2.54);
    const japanSize = euSize;
    const indiaSize = Math.round(handInInches * 2.54 -1);

    setResult({
        usUk: usUkSize,
        eu: euSize,
        japan: japanSize,
        india: indiaSize
    });
  };

  const unit = form.watch('unit');

  const sizeChartData = [
    { handIn: 6, usUk: 6, eu: 15, japan: 15, india: 15 },
    { handIn: 6.5, usUk: 6.5, eu: 16, japan: 16, india: 16 },
    { handIn: 7, usUk: 7, eu: 18, japan: 18, india: 17 },
    { handIn: 7.5, usUk: 7.5, eu: 19, japan: 19, india: 18 },
    { handIn: 8, usUk: 8, eu: 20, japan: 20, india: 19 },
    { handIn: 8.5, usUk: 8.5, eu: 21, japan: 21, india: 20 },
    { handIn: 9, usUk: 9, eu: 23, japan: 23, india: 21 },
    { handIn: 9.5, usUk: 9.5, eu: 24, japan: 24, india: 22 },
    { handIn: 10, usUk: 10, eu: 25, japan: 25, india: 23 },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CardDescription>Measure the circumference of your dominant hand just below the knuckles (excluding the thumb) to find your glove size.</CardDescription>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="handCircumference"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Hand Circumference ({unit})</FormLabel>
                        <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 8" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
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
                                <SelectItem value="inch">Inches</SelectItem>
                                <SelectItem value="cm">Centimeters</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormItem>
                )} />
            </div>
          <Button type="submit">Convert Glove Size</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Hand className="h-8 w-8 text-primary" />
              <CardTitle>Recommended Glove Sizes</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 border rounded-lg"><p className="font-semibold">US/UK</p><p className="text-xl font-bold">{result.usUk}</p></div>
                <div className="p-3 border rounded-lg"><p className="font-semibold">EU</p><p className="text-xl font-bold">{result.eu}</p></div>
                <div className="p-3 border rounded-lg"><p className="font-semibold">Japan</p><p className="text-xl font-bold">{result.japan} cm</p></div>
                <div className="p-3 border rounded-lg"><p className="font-semibold">India</p><p className="text-xl font-bold">{result.india} cm</p></div>
            </div>
          </CardContent>
        </Card>
      )}

       <Accordion type="single" collapsible defaultValue="how-it-works" className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator converts your hand circumference into standard glove sizes. It first converts your measurement into inches if needed. Then, it uses common sizing formulas to estimate the corresponding size in different regional systems. For example, US/UK sizes are typically the hand circumference in inches rounded to the nearest half-size.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="space-y-4 prose prose-sm dark:prose-invert max-w-none">
        <h3>Ultimate Glove Size Guide: How to Choose the Perfect Glove for Men and Women</h3>
        <p>Finding the right glove size is essential for comfort, performance, and safety. Gloves that are too tight can restrict movement and cause discomfort, while gloves that are too loose can slip off or reduce dexterity. A glove size converter makes it simple to determine your ideal glove size across multiple regions, including US, UK, EU, Japan, and India.</p>
        <p>This guide explains how to measure your hand accurately, convert your measurements into different sizing systems, and choose the perfect glove for every activity.</p>
        
        <h4>Why Glove Size Matters</h4>
        <ul className="list-disc list-inside">
            <li>Sports and outdoor activities: Improved grip and dexterity.</li>
            <li>Work and safety gloves: Prevent hand injuries and ensure protection.</li>
            <li>Fashion gloves: Comfort and proper style.</li>
        </ul>
        <p>Using a glove size converter ensures your gloves fit comfortably, no matter where they’re purchased or which country’s sizing system they use.</p>

        <h4>How Glove Sizes Are Measured</h4>
        <p>Glove sizes are determined by the circumference of your dominant hand (excluding the thumb). Measurements can be taken in inches or centimeters.</p>
        <ul className="list-disc list-inside">
            <li><strong>US / UK Glove Size:</strong> Typically measured in inches.</li>
            <li><strong>EU Glove Size:</strong> Measured in centimeters.</li>
            <li><strong>Japan Glove Size:</strong> Same as EU, in centimeters.</li>
            <li><strong>India Glove Size:</strong> Approximate conversion based on EU size minus 1 cm.</li>
        </ul>

        <h4>Step-by-Step Guide to Measuring Your Hand</h4>
        <ol className="list-decimal list-inside">
            <li><strong>Use a flexible measuring tape:</strong> Avoid rigid rulers.</li>
            <li><strong>Measure the widest part of your hand:</strong> Wrap the tape around your hand just below the knuckles, excluding the thumb.</li>
            <li><strong>Record the circumference:</strong> Note the measurement in inches or centimeters depending on your preference.</li>
        </ol>

        <h4>Using a Glove Size Converter</h4>
        <p>A glove size converter makes converting your measurement easy:</p>
        <ol className="list-decimal list-inside">
          <li>Enter your hand circumference in inches or centimeters.</li>
          <li>Select the unit of measurement.</li>
          <li>The calculator instantly provides glove sizes for US/UK, EU, Japan, and India.</li>
        </ol>
        <p>This method eliminates guesswork, especially for online shopping or purchasing international brands.</p>

        <h4>Glove Size Chart (Approximate)</h4>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Hand (in)</TableHead>
                    <TableHead>US/UK</TableHead>
                    <TableHead>EU</TableHead>
                    <TableHead>Japan</TableHead>
                    <TableHead>India</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {sizeChartData.map(row => (
                    <TableRow key={row.handIn}>
                        <TableCell>{row.handIn}</TableCell>
                        <TableCell>{row.usUk}</TableCell>
                        <TableCell>{row.eu}</TableCell>
                        <TableCell>{row.japan}</TableCell>
                        <TableCell>{row.india}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
        <p className="text-xs mt-2">Note: Sizes may vary slightly by brand or glove style.</p>

        <h4>Tips for Choosing the Right Glove</h4>
        <ul className="list-disc list-inside">
            <li><strong>Measure both hands:</strong> One hand may be slightly larger. Use the larger measurement.</li>
            <li><strong>Consider the glove type:</strong> Work gloves, winter gloves, and sports gloves may require slightly different fits.</li>
            <li><strong>Allow some room:</strong> Gloves should fit snugly but allow finger movement.</li>
            <li><strong>Check brand-specific charts:</strong> Different manufacturers may have minor variations.</li>
        </ul>

        <h4>Common Mistakes to Avoid</h4>
        <ul className="list-disc list-inside">
            <li>Buying gloves based on usual size: Always measure your hand.</li>
            <li>Ignoring regional sizing differences: Check US, UK, EU, Japan, and India conversions.</li>
            <li>Overlooking glove material: Leather gloves may stretch; synthetic materials may fit tighter.</li>
            <li>Skipping measurement: Hand sizes can change slightly over time.</li>
        </ul>

        <h4>Benefits of Using a Glove Size Converter</h4>
        <ul className="list-disc list-inside">
            <li>Ensures a comfortable and accurate fit for gloves across all regions.</li>
            <li>Reduces returns and exchanges when buying online.</li>
            <li>Saves time by converting sizes for international purchases.</li>
            <li>Enhances hand comfort, safety, and performance.</li>
        </ul>

        <h4>FAQ: Glove Size</h4>
        <p><strong>Q1: How do I know my US glove size if I know my EU size?</strong><br/>Use a glove size converter. Typically, US/UK sizes are slightly smaller than EU sizes in centimeters.</p>
        <p><strong>Q2: Can I wear one size for men and women?</strong><br/>Gloves are generally unisex, but sizing may differ. Always measure your hand for the most accurate fit.</p>
        <p><strong>Q3: What if my measurement is between sizes?</strong><br/>Choose the larger size for comfort, especially for winter or work gloves.</p>
        <p><strong>Q4: Are India glove sizes reliable?</strong><br/>India sizes are approximate but usually based on EU size minus 1 cm. A converter ensures accuracy.</p>

        <h4>Conclusion</h4>
        <p>Measuring your hand and using a glove size converter is the easiest way to find gloves that fit perfectly. By understanding US, UK, EU, Japan, and India sizing, you can shop confidently online or in-store.</p>
        <p>Properly fitted gloves improve comfort, protect your hands, and enhance performance, whether for sports, work, or fashion. Always measure your hand, use a reliable converter, and consult brand-specific size charts for the best results.</p>
      </div>
    </div>
  );
}
