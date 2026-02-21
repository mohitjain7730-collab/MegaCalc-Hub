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
import { Shirt } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

const sizeCharts = {
  men: [
    { US: "34", UK: "34", EU: "44", India: "34", Japan: "S", Intl: "S" },
    { US: "36", UK: "36", EU: "46", India: "36", Japan: "M", Intl: "M" },
    { US: "38", UK: "38", EU: "48", India: "38", Japan: "L", Intl: "L" },
    { US: "40", UK: "40", EU: "50", India: "40", Japan: "XL", Intl: "XL" },
    { US: "42", UK: "42", EU: "52", India: "42", Japan: "XXL", Intl: "XXL" },
    { US: "44", UK: "44", EU: "54", India: "44", Japan: "3XL", Intl: "3XL" }
  ],
  women: [
    { US: "2", UK: "6", EU: "34", India: "XS", Japan: "5", Intl: "XS" },
    { US: "4", UK: "8", EU: "36", India: "S", Japan: "7", Intl: "S" },
    { US: "6", UK: "10", EU: "38", India: "M", Japan: "9", Intl: "M" },
    { US: "8", UK: "12", EU: "40", India: "L", Japan: "11", Intl: "L" },
    { US: "10", UK: "14", EU: "42", India: "XL", Japan: "13", Intl: "XL" },
    { US: "12", UK: "16", EU: "44", India: "XXL", Japan: "15", Intl: "XXL" }
  ],
  kids: [
    { US: "2T", UK: "2", EU: "92", India: "2Y", Japan: "90", Intl: "2Y" },
    { US: "3T", UK: "3", EU: "98", India: "3Y", Japan: "95", Intl: "3Y" },
    { US: "4T", UK: "4", EU: "104", India: "4Y", Japan: "100", Intl: "4Y" },
    { US: "5", UK: "5", EU: "110", India: "5Y", Japan: "105", Intl: "5Y" },
    { US: "6", UK: "6", EU: "116", India: "6Y", Japan: "110", Intl: "6Y" },
    { US: "7", UK: "7", EU: "122", India: "7Y", Japan: "115", Intl: "7Y" },
    { US: "8", UK: "8", EU: "128", India: "8Y", Japan: "120", Intl: "8Y" },
    { US: "10", UK: "10", EU: "140", India: "10Y", Japan: "130", Intl: "10Y" },
    { US: "12", UK: "12", EU: "152", India: "12Y", Japan: "140", Intl: "12Y" }
  ]
};

const formSchema = z.object({
  gender: z.enum(['men', 'women', 'kids']),
  fromRegion: z.enum(['US', 'UK', 'EU', 'India', 'Japan', 'Intl']),
  inputSize: z.string().min(1, "Please enter a size."),
});

type FormValues = z.infer<typeof formSchema>;
type SizeRow = { [key: string]: string | number };

export default function ClothSizeConverter() {
  const [result, setResult] = useState<SizeRow | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: 'men',
      fromRegion: 'US',
      inputSize: '',
    },
  });

  const onSubmit = (values: FormValues) => {
    const { gender, fromRegion, inputSize } = values;
    const chart = sizeCharts[gender];
    const match = chart.find(row => String(row[fromRegion as keyof typeof row]).toLowerCase() === inputSize.toLowerCase());

    if (match) {
      setResult(match);
      form.clearErrors('inputSize');
    } else {
      setResult(null);
      const availableSizes = chart.map(row => row[fromRegion as keyof typeof row]).join(', ');
      form.setError('inputSize', { type: 'manual', message: `Size not found. Available sizes for this region are: ${availableSizes}` });
    }
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CardDescription>
                Convert clothing sizes for Men, Women, and Kids across US, UK, EU, India, Japan, and International standards.
            </CardDescription>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="gender" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Gender / Age Group</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="men">Men</SelectItem>
                                <SelectItem value="women">Women</SelectItem>
                                <SelectItem value="kids">Kids</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormItem>
                )} />
                <FormField control={form.control} name="fromRegion" render={({ field }) => (
                     <FormItem>
                        <FormLabel>From Region</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="US">US</SelectItem>
                                <SelectItem value="UK">UK</SelectItem>
                                <SelectItem value="EU">EU</SelectItem>
                                <SelectItem value="India">India</SelectItem>
                                <SelectItem value="Japan">Japan</SelectItem>
                                <SelectItem value="Intl">International</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormItem>
                )} />
                 <FormField control={form.control} name="inputSize" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                        <FormLabel>Enter Size</FormLabel>
                        <FormControl><Input placeholder="e.g. M, 10, 42, 36" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
             </div>
            <Button type="submit">Convert Size</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader>
                <div className='flex items-center gap-4'>
                    <Shirt className="h-8 w-8 text-primary" />
                    <CardTitle>Converted Sizes</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>US</TableHead>
                            <TableHead>UK</TableHead>
                            <TableHead>EU</TableHead>
                            <TableHead>India</TableHead>
                            <TableHead>Japan</TableHead>
                            <TableHead>Int'l</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>{result.US}</TableCell>
                            <TableCell>{result.UK}</TableCell>
                            <TableCell>{result.EU}</TableCell>
                            <TableCell>{result.India}</TableCell>
                            <TableCell>{result.Japan}</TableCell>
                            <TableCell>{result.Intl}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <CardDescription className="mt-4 text-xs">Note: These are standard conversions and may vary by brand. Always check the manufacturer's specific size guide.</CardDescription>
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
        <h3 className='font-bold'>👕 Complete Understanding of Global Clothing Size Conversion</h3>
        <p className="text-xs">Finding the right clothing size can be confusing, especially when brands and regions use completely different systems. A US Medium isn’t always the same as a UK Medium, and EU numbers can make it even more complicated. This guide explains how global clothing sizes work, how to measure yourself correctly, and how to use size conversion charts to shop confidently—no matter where you are in the world.</p>
        
        <h4 className='font-bold'>🧭 1. Why Clothing Sizes Differ Around the World</h4>
        <p className="text-xs">Clothing sizes differ mainly because of regional body shape averages and measurement systems (inches vs. centimeters). For example:</p>
        <ul className="list-disc list-inside text-xs">
          <li>The US often uses inches (e.g., chest 38" or waist 32").</li>
          <li>The EU uses numbers (e.g., 48, 50, 52) which are based on half of the chest circumference in cm.</li>
          <li>India generally follows UK sizing for men’s wear and EU sizing for women’s wear.</li>
          <li>Japan uses a unique numbering system (5, 7, 9, 11, etc.) based on height and bust.</li>
          <li>International (S, M, L, XL) is meant as a simplified universal standard — but brands interpret it differently.</li>
        </ul>
        <p className="text-xs">Because of these differences, two shirts labeled “M” can fit completely differently depending on where you buy them.</p>

        <h4 className='font-bold'>📏 2. How to Measure Yourself Correctly</h4>
        <p className="text-xs">Before using any clothing size chart or converter, take accurate body measurements. You’ll need:</p>
        <ul className="list-disc list-inside text-xs">
          <li>Chest (Bust) – Measure around the fullest part of your chest.</li>
          <li>Waist – Measure around your natural waistline (just above your belly button).</li>
          <li>Hips – Measure around the widest part of your hips.</li>
          <li>Inseam – From the top of your inner thigh to your ankle.</li>
          <li>Shoulder Width – Across the back from shoulder to shoulder.</li>
        </ul>
        <p className="text-xs"><strong>Pro tip:</strong> Always measure in centimeters — it’s the most universal unit and converts easily to any system.</p>

        <h4 className='font-bold'>👨 Men’s Clothing Size Conversion Explained</h4>
        <p className="text-xs">Men’s clothing sizes typically follow either numbered or lettered systems.</p>
        <Table>
          <TableHeader><TableRow><TableHead>US</TableHead><TableHead>UK</TableHead><TableHead>EU</TableHead><TableHead>India</TableHead><TableHead>Japan</TableHead><TableHead>International</TableHead></TableRow></TableHeader>
          <TableBody>
            <TableRow><TableCell>34</TableCell><TableCell>34</TableCell><TableCell>44</TableCell><TableCell>34</TableCell><TableCell>S</TableCell><TableCell>S</TableCell></TableRow>
            <TableRow><TableCell>36</TableCell><TableCell>36</TableCell><TableCell>46</TableCell><TableCell>36</TableCell><TableCell>M</TableCell><TableCell>M</TableCell></TableRow>
            <TableRow><TableCell>38</TableCell><TableCell>38</TableCell><TableCell>48</TableCell><TableCell>38</TableCell><TableCell>L</TableCell><TableCell>L</TableCell></TableRow>
            <TableRow><TableCell>40</TableCell><TableCell>40</TableCell><TableCell>50</TableCell><TableCell>40</TableCell><TableCell>XL</TableCell><TableCell>XL</TableCell></TableRow>
            <TableRow><TableCell>42</TableCell><TableCell>42</TableCell><TableCell>52</TableCell><TableCell>42</TableCell><TableCell>XXL</TableCell><TableCell>XXL</TableCell></TableRow>
          </TableBody>
        </Table>
        <p className="text-xs">💡 Note: For shirts, EU sizes are generally +10 compared to UK sizes. For trousers, US sizes are waist-based (e.g., 32W), while EU uses cm (e.g., 48 = 32W). Indian men’s wear typically mirrors UK sizing.</p>

        <h4 className='font-bold'>👩 Women’s Clothing Size Conversion Explained</h4>
        <p className="text-xs">Women’s sizes are trickier because they’re often based on body shape rather than strict measurements. A US 6 doesn’t exactly match a UK 6 or an EU 38 — and vanity sizing by brands makes it worse.</p>
        <Table>
            <TableHeader><TableRow><TableHead>US</TableHead><TableHead>UK</TableHead><TableHead>EU</TableHead><TableHead>India</TableHead><TableHead>Japan</TableHead><TableHead>International</TableHead></TableRow></TableHeader>
            <TableBody>
                <TableRow><TableCell>2</TableCell><TableCell>6</TableCell><TableCell>34</TableCell><TableCell>XS</TableCell><TableCell>5</TableCell><TableCell>XS</TableCell></TableRow>
                <TableRow><TableCell>4</TableCell><TableCell>8</TableCell><TableCell>36</TableCell><TableCell>S</TableCell><TableCell>7</TableCell><TableCell>S</TableCell></TableRow>
                <TableRow><TableCell>6</TableCell><TableCell>10</TableCell><TableCell>38</TableCell><TableCell>M</TableCell><TableCell>9</TableCell><TableCell>M</TableCell></TableRow>
                <TableRow><TableCell>8</TableCell><TableCell>12</TableCell><TableCell>40</TableCell><TableCell>L</TableCell><TableCell>11</TableCell><TableCell>L</TableCell></TableRow>
                <TableRow><TableCell>10</TableCell><TableCell>14</TableCell><TableCell>42</TableCell><TableCell>XL</TableCell><TableCell>13</TableCell><TableCell>XL</TableCell></TableRow>
                <TableRow><TableCell>12</TableCell><TableCell>16</TableCell><TableCell>44</TableCell><TableCell>XXL</TableCell><TableCell>15</TableCell><TableCell>XXL</TableCell></TableRow>
            </TableBody>
        </Table>
        <p className="text-xs">🧵 Tips for Women’s Sizing: Japanese sizes (5, 7, 9, 11, etc.) are smaller — a US 6 is usually a Japan 9. India follows a mix of UK and EU sizing — sometimes labeled as “Small (UK 8)” or “Medium (EU 38).” When buying online, always check brand-specific charts — they often differ by 1–2 sizes.</p>

        <h4 className='font-bold'>👶 Kids & Infants Clothing Size Conversion</h4>
        <p className="text-xs">Kids’ sizes depend on age, height, and weight, which vary widely across regions.</p>
        <Table>
            <TableHeader><TableRow><TableHead>US</TableHead><TableHead>UK</TableHead><TableHead>EU</TableHead><TableHead>India</TableHead><TableHead>Japan</TableHead><TableHead>International</TableHead></TableRow></TableHeader>
            <TableBody>
                <TableRow><TableCell>2T</TableCell><TableCell>2</TableCell><TableCell>92</TableCell><TableCell>2Y</TableCell><TableCell>90</TableCell><TableCell>2Y</TableCell></TableRow>
                <TableRow><TableCell>3T</TableCell><TableCell>3</TableCell><TableCell>98</TableCell><TableCell>3Y</TableCell><TableCell>95</TableCell><TableCell>3Y</TableCell></TableRow>
                <TableRow><TableCell>4T</TableCell><TableCell>4</TableCell><TableCell>104</TableCell><TableCell>4Y</TableCell><TableCell>100</TableCell><TableCell>4Y</TableCell></TableRow>
                <TableRow><TableCell>5</TableCell><TableCell>5</TableCell><TableCell>110</TableCell><TableCell>5Y</TableCell><TableCell>105</TableCell><TableCell>5Y</TableCell></TableRow>
                <TableRow><TableCell>6</TableCell><TableCell>6</TableCell><TableCell>116</TableCell><TableCell>6Y</TableCell><TableCell>110</TableCell><TableCell>6Y</TableCell></TableRow>
            </TableBody>
        </Table>
        <p className="text-xs">👨‍👩‍👧 Note: “T” in US sizes stands for “Toddler.” EU and Japan use centimeters for height. For online shopping, it’s best to use height-based sizing (e.g., 110 cm) rather than age alone.</p>

        <h4 className='font-bold'>🌎 Regional Clothing Conversion Systems</h4>
        <p className="text-xs">Here’s a breakdown of how each region defines sizes:</p>
        <ul className="list-disc list-inside text-xs">
            <li>US System: Uses numbers and letters, based on inches.</li>
            <li>UK System: Similar to US but one size smaller (US 8 ≈ UK 10 for women).</li>
            <li>EU System: Based on body measurements in centimeters.</li>
            <li>Indian System: Follows UK (for men) and EU (for women).</li>
            <li>Japanese System: Uses height and body proportions — sizes like 9AR or 11AB indicate fit variations.</li>
            <li>International (S/M/L): Simplified, but brand-dependent.</li>
        </ul>

        <h4 className='font-bold'>🧠 Understanding the Conversion Logic (How Calculators Work)</h4>
        <p className="text-xs">Clothing size converters work using mapped data tables between regions. There’s no mathematical “formula” — because conversion depends on body fit, manufacturer tolerances, and fabric elasticity.</p>
        <p className="text-xs">But in a simplified sense:</p>
        <p className="font-mono text-xs p-2 bg-muted rounded-md">EU Size = (Chest in inches × 2.54) + 12<br/>UK Size ≈ US Size - 2<br/>India (Men) ≈ UK Size<br/>Japan ≈ (EU Size - 32)</p>

        <h4 className='font-bold'>🧵 Common Conversion Mistakes</h4>
        <ul className="list-disc list-inside text-xs">
            <li>Assuming “M” means the same globally – A Medium in Japan fits more like a Small in the US.</li>
            <li>Ignoring fabric stretch – Cotton and wool shrink slightly, while synthetic fabrics may not.</li>
            <li>Overlooking unisex sizing – Some brands merge men’s and women’s sizes but don’t mention it.</li>
            <li>Mixing shoes with clothing systems – Shoe sizes are completely different from clothing — don’t compare them.</li>
        </ul>

        <h4 className='font-bold'>💬 Pro Tips for Global Shoppers</h4>
        <ul className="list-disc list-inside text-xs">
            <li>Always check both numeric and letter size charts on brand websites.</li>
            <li>Read reviews — users often mention if an item “runs small” or “fits loose.”</li>
            <li>When in doubt, size up for comfort, especially for outerwear.</li>
            <li>If possible, measure an existing garment that fits you well and match its dimensions.</li>
            <li>Prefer brands that list measurements in cm — it’s easier to convert.</li>
        </ul>

        <h4 className='font-bold'>🔗 Related Calculators and Converters</h4>
        <p className="text-xs">To make your fashion shopping seamless, check out:</p>
        <ul className="list-disc list-inside text-xs">
            <li><Link href="/conversions/shoe-size-converter" className="text-primary underline">👟 Universal Shoe Size Converter</Link></li>
            <li>🎽 Body Measurement to Clothing Size Calculator</li>
            <li>💍 Ring Size Converter</li>
            <li>🧢 Hat Size Converter</li>
            <li>🧤 Glove Size Converter</li>
        </ul>

        <h4 className='font-bold'>📚 Final Thoughts</h4>
        <p className="text-xs">Global clothing sizes may never be perfectly standardized — but tools like this Universal Clothing Size Converter make it far easier to navigate. Whether you’re ordering a jacket from Europe, a dress from Japan, or a kurta from India, this converter helps you find your ideal fit with just one click.</p>
        <p className="text-xs">Understanding the basics of how clothing sizes translate across regions saves you time, money, and the frustration of returns. With consistent measurements and a reliable converter, online shopping becomes smoother — and your wardrobe, perfectly tailored to you.</p>
      </div>
    </div>
  );
}
