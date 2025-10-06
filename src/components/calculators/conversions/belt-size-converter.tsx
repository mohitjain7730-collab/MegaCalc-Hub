
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HandHelping } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


const formSchema = z.object({
  unit: z.enum(['inch', 'cm']),
  waist: z.number().min(20).max(60),
});

type FormValues = z.infer<typeof formSchema>;

interface Result {
  us: number;
  uk: number;
  eu: number;
}

export default function BeltSizeConverter() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'inch',
      waist: 32,
    },
  });

  const { watch, setValue } = form;
  const unit = watch('unit');
  const waist = watch('waist');

  useEffect(() => {
    let waistInInches = unit === 'inch' ? waist : waist / 2.54;
    let beltInInches = waistInInches + 2;

    let usSize = Math.round(beltInInches);
    let ukSize = usSize;
    let euSize = Math.round(beltInInches * 2.54);

    setResult({ us: usSize, uk: ukSize, eu: euSize });
  }, [unit, waist]);

  const handleUnitChange = (newUnit: 'inch' | 'cm') => {
    const currentWaist = form.getValues('waist');
    let newWaist = currentWaist;

    if (unit === 'inch' && newUnit === 'cm') {
      newWaist = currentWaist * 2.54;
    } else if (unit === 'cm' && newUnit === 'inch') {
      newWaist = currentWaist / 2.54;
    }
    
    setValue('unit', newUnit);
    setValue('waist', parseFloat(newWaist.toFixed(1)));
  }

  const min = unit === 'inch' ? 20 : 50;
  const max = unit === 'inch' ? 60 : 152;
  const step = unit === 'inch' ? 0.5 : 1;

  const sizeChartData = [
      { waist: 28, us_uk: 30, eu: 76 },
      { waist: 30, us_uk: 32, eu: 81 },
      { waist: 32, us_uk: 34, eu: 86 },
      { waist: 34, us_uk: 36, eu: 91 },
      { waist: 36, us_uk: 38, eu: 97 },
      { waist: 38, us_uk: 40, eu: 102 },
      { waist: 40, us_uk: 42, eu: 107 },
      { waist: 42, us_uk: 44, eu: 112 },
      { waist: 44, us_uk: 46, eu: 117 },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Unit</FormLabel>
                  <Select onValueChange={(value: 'inch' | 'cm') => handleUnitChange(value)} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="inch">Inches (in)</SelectItem>
                      <SelectItem value="cm">Centimeters (cm)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
            <FormField
              control={form.control}
              name="waist"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Waist Size: {waist} {unit === 'inch' ? 'in' : 'cm'}</FormLabel>
                  <FormControl>
                    <Slider
                      min={min}
                      max={max}
                      step={step}
                      value={[field.value]}
                      onValueChange={(vals) => field.onChange(vals[0])}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <HandHelping className="h-8 w-8 text-primary" />
              <CardTitle>Recommended Belt Sizes</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-3 border rounded-lg">
                    <p className="font-semibold">US Size</p>
                    <p className="text-xl font-bold">{result.us}"</p>
                </div>
                <div className="p-3 border rounded-lg">
                    <p className="font-semibold">UK Size</p>
                    <p className="text-xl font-bold">{result.uk}"</p>
                </div>
                <div className="p-3 border rounded-lg">
                    <p className="font-semibold">EU Size</p>
                    <p className="text-xl font-bold">{result.eu} cm</p>
                </div>
            </div>
          </CardContent>
        </Card>
      )}

       <Accordion type="single" collapsible defaultValue="how-it-works" className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator follows the standard convention for belt sizing:</p>
                <ol className="list-decimal list-inside space-y-2 mt-2">
                    <li>It takes your waist measurement (the size of your trousers/pants).</li>
                    <li>It adds 2 inches to your waist size to determine the ideal belt size in inches. This extra length allows the belt to be comfortably buckled in the middle hole.</li>
                    <li>It then converts this ideal inch-based size to its equivalent in other regional systems, such as centimeters for the EU market.</li>
                </ol>
            </AccordionContent>
        </AccordionItem>
      </Accordion>

       <div className="space-y-4 prose prose-sm dark:prose-invert max-w-none">
        <h3 className='font-bold'>Ultimate Belt Size Guide: How to Choose the Perfect Belt for Men and Women</h3>
        <p className="text-xs">Finding the right belt size can be surprisingly tricky. Whether you are shopping online or in-store, wearing a belt that is too small or too large can ruin the look of an outfit and even be uncomfortable. This comprehensive guide will help you understand belt sizing, convert your waist size into US, UK, and EU belt sizes, and provide tips for choosing the perfect belt style for any occasion.</p>
        
        <h4 className='font-bold'>Why Belt Size Matters</h4>
        <p className="text-xs">A belt is not just a functional accessory; it is a statement piece that enhances your outfit. Wearing the wrong size can:</p>
        <ul className="list-disc list-inside text-xs">
          <li>Cause discomfort around your waist.</li>
          <li>Look sloppy or unprofessional.</li>
          <li>Make clothing fit awkwardly, especially pants and formal attire.</li>
        </ul>
        <p className="text-xs">Using a belt size converter ensures you select a belt that fits comfortably while looking stylish. Our calculator converts waist measurements into US, UK, and EU belt sizes for a hassle-free shopping experience.</p>

        <h4 className='font-bold'>How Belt Sizes Are Measured</h4>
        <p className="text-xs">Belt sizes are usually measured based on waist circumference. There are minor differences depending on the region:</p>
        <ul className="list-disc list-inside text-xs">
          <li><strong>US Belt Size:</strong> Typically measured in inches. Belt size is often 2 inches larger than your waist.</li>
          <li><strong>UK Belt Size:</strong> Similar to the US, also measured in inches.</li>
          <li><strong>EU Belt Size:</strong> Measured in centimeters and converted from the waist measurement plus 2 inches.</li>
        </ul>
        <p className="text-xs">For example, if your waist is 32 inches, your recommended belt size is 34 inches (US/UK) or 86 cm (EU).</p>

        <h4 className='font-bold'>Step-by-Step Guide to Measuring Your Waist</h4>
        <p className="text-xs">Before using a belt size converter, it’s essential to measure your waist accurately. Follow these steps:</p>
        <ol className="list-decimal list-inside text-xs">
          <li><strong>Use a soft measuring tape:</strong> Avoid rigid rulers; a flexible tape works best.</li>
          <li><strong>Measure at the natural waistline:</strong> This is usually the narrowest part of your waist, just above your belly button.</li>
          <li><strong>Stand straight but relaxed:</strong> Do not suck in your stomach, as this will give an inaccurate measurement.</li>
          <li><strong>Take the measurement in inches or centimeters:</strong> Record the value to use in the belt size converter.</li>
        </ol>

        <h4 className='font-bold'>Belt Size Chart</h4>
        <p className="text-xs">For reference, here’s a general belt size chart for men and women:</p>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Waist (inches)</TableHead>
                    <TableHead>US/UK Belt Size</TableHead>
                    <TableHead>EU Belt Size (cm)</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {sizeChartData.map(row => (
                    <TableRow key={row.waist}>
                        <TableCell>{row.waist}</TableCell>
                        <TableCell>{row.us_uk}</TableCell>
                        <TableCell>{row.eu}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
        <p className="text-xs font-bold mt-2">💡 Tip: Always choose a belt where the middle hole aligns with your waist measurement.</p>
        
        <h4 className='font-bold'>Types of Belts</h4>
        <p className="text-xs">Belts come in various styles, materials, and designs. Choosing the right type depends on the occasion and outfit.</p>
        <ol className="list-decimal list-inside text-xs">
          <li><strong>Leather Belts:</strong> Classic and versatile, suitable for both formal and casual wear.</li>
          <li><strong>Fabric and Canvas Belts:</strong> More casual, perfect for summer or outdoor outfits.</li>
          <li><strong>Reversible Belts:</strong> Offer two color options in one, great for flexibility.</li>
          <li><strong>Designer Belts:</strong> Statement pieces that can elevate a simple outfit.</li>
        </ol>

        <h4 className='font-bold'>Choosing the Right Belt Width</h4>
        <ul className="list-disc list-inside text-xs">
          <li><strong>1–1.25 inches:</strong> Ideal for formal trousers and suits.</li>
          <li><strong>1.5–2 inches:</strong> Perfect for casual pants, jeans, and everyday wear.</li>
          <li><strong>Over 2 inches:</strong> More suitable for heavy-duty or statement belts.</li>
        </ul>
        <p className="text-xs font-bold mt-2">Pro Tip: Match belt width with shoe width for a cohesive look.</p>
        
        <h4 className='font-bold'>Common Belt Size Mistakes</h4>
        <ul className="list-disc list-inside text-xs">
          <li>Buying belts based on pants size: Pants size is not always the same as waist size.</li>
          <li>Ignoring international size differences: Always check US, UK, or EU conversions.</li>
          <li>Choosing a belt too long or short: Use the middle-hole guideline to avoid this.</li>
        </ul>
        
        <h4 className='font-bold'>Belt Size FAQ</h4>
        <p className="text-xs"><strong>Q1: How do I know my belt size if I only know my pants size?</strong><br/>Measure your waist at the natural waistline and add 2 inches for US/UK sizing. Use a belt size converter for accurate results.</p>
        <p className="text-xs"><strong>Q2: Can I wear a smaller belt and stretch it?</strong><br/>Not recommended. Stretching can damage the belt and shorten its lifespan.</p>
        <p className="text-xs"><strong>Q3: Are men's and women's belts sized differently?</strong><br/>Men’s belts usually follow the US/UK/EU system, while women’s belts may use smaller sizing or adjustable options. Always measure the waist to confirm.</p>
        
        <h4 className='font-bold'>🔗 Related Calculators and Converters</h4>
        <ul className="list-disc list-inside text-xs">
            <li><Link href="/category/conversions/shoe-size-converter" className="text-primary underline">👟 Universal Shoe Size Converter</Link></li>
            <li><Link href="/category/conversions/cloth-size-converter" className="text-primary underline">👕 Universal Clothing Size Converter</Link></li>
            <li><Link href="/category/conversions/ring-size-converter" className="text-primary underline">💍 Ring Size Converter</Link></li>
            <li><Link href="/category/conversions/hat-size-converter" className="text-primary underline">🧢 Hat Size Converter</Link></li>
        </ul>
      </div>
    </div>
  );
}
