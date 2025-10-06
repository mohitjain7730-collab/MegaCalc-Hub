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
import { Footprints } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const formSchema = z.object({
  gender: z.enum(['men', 'women']),
  fromUnit: z.enum(['US', 'UK', 'EU', 'IN', 'CM', 'JP']),
  inputSize: z.coerce.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

interface Result {
    US: number;
    UK: number;
    EU: number;
    IN: number;
    CM: number;
    JP: number;
}

export default function ShoeSizeConverter() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: 'men',
      fromUnit: 'US',
      inputSize: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { gender, fromUnit, inputSize } = values;

    let US = 0, UK = 0, EU = 0, IN = 0, CM = 0, JP = 0;

    if (fromUnit === "US") {
        US = inputSize;
        if (gender === "men") {
          UK = US - 0.5;
          EU = US + 33;
          IN = US - 0.5;
          CM = (US * 0.847) + 18.66;
        } else {
          UK = US - 2;
          EU = US + 31;
          IN = UK;
          CM = (US * 0.847) + 17.2;
        }
        JP = CM;
    } else if (fromUnit === "UK" || fromUnit === "IN") {
        UK = inputSize;
        IN = UK;
        if (gender === "men") {
          US = UK + 0.5;
          EU = US + 33;
          CM = (US * 0.847) + 18.66;
        } else {
          US = UK + 2;
          EU = US + 31;
          CM = (US * 0.847) + 17.2;
        }
        JP = CM;
    } else if (fromUnit === "EU") {
        EU = inputSize;
        if (gender === "men") {
          US = EU - 33;
          UK = US - 0.5;
          IN = UK;
          CM = (EU * 2 / 3);
        } else {
          US = EU - 31;
          UK = US - 2;
          IN = UK;
          CM = (EU * 2 / 3);
        }
        JP = CM;
    } else if (fromUnit === "CM" || fromUnit === "JP") {
        CM = inputSize;
        JP = CM;
        if (gender === "men") {
          US = (CM - 18.66) / 0.847;
          UK = US - 0.5;
        } else {
          US = (CM - 17.2) / 0.847;
          UK = US - 2;
        }
        IN = UK;
        EU = (gender === "men") ? (US + 33) : (US + 31);
    }

    setResult({ US, UK, EU, IN, CM, JP });
  };
  
  return (
    <div className="space-y-8">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="gender" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                <SelectContent><SelectItem value="men">Men</SelectItem><SelectItem value="women">Women</SelectItem></SelectContent>
                            </Select>
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="fromUnit" render={({ field }) => (
                        <FormItem>
                            <FormLabel>From Unit</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="US">US</SelectItem>
                                    <SelectItem value="UK">UK</SelectItem>
                                    <SelectItem value="EU">EU</SelectItem>
                                    <SelectItem value="IN">India</SelectItem>
                                    <SelectItem value="CM">Centimeters (CM)</SelectItem>
                                    <SelectItem value="JP">Japan (JP)</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="inputSize" render={({ field }) => (
                        <FormItem><FormLabel>Enter Size</FormLabel><FormControl><Input type="number" step="0.1" placeholder="e.g., 9.5" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <Button type="submit" className="w-full">Convert Size</Button>
            </form>
        </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Footprints className="h-8 w-8 text-primary" /><CardTitle>Converted Shoe Sizes</CardTitle></div></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>US</TableHead>
                            <TableHead>UK</TableHead>
                            <TableHead>EU</TableHead>
                            <TableHead>India</TableHead>
                            <TableHead>CM</TableHead>
                            <TableHead>Japan</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>{result.US.toFixed(1)}</TableCell>
                            <TableCell>{result.UK.toFixed(1)}</TableCell>
                            <TableCell>{result.EU.toFixed(1)}</TableCell>
                            <TableCell>{result.IN.toFixed(1)}</TableCell>
                            <TableCell>{result.CM.toFixed(1)}</TableCell>
                            <TableCell>{result.JP.toFixed(1)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <CardDescription className="mt-4 text-xs">Note: These conversions are based on standard formulas and may vary slightly by brand. Always check the manufacturer's size guide.</CardDescription>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible defaultValue='how-it-works' className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                This calculator uses a set of common, generalized formulas to convert between international shoe sizes. It first converts the input size to a base unit (like US or CM) and then calculates all other sizes from there. The formulas differ for men's and women's sizes due to different scaling and base points in many sizing systems.
            </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="space-y-4 prose prose-sm dark:prose-invert max-w-none">
        <h3>Complete Understanding of Shoe Sizes and Conversions</h3>
        <h4>🧩 1. Why Shoe Sizes Differ Around the World</h4>
        <p>If you’ve ever tried buying shoes from another country, you’ve probably noticed that the sizes never match. A US size 9 is not the same as a UK size 9 or a EU 43. This confusion happens because different countries use different measurement systems — some use inches, others use centimeters, and many have their own historical sizing standards.</p>
        <p>For example:</p>
        <ul className="list-disc list-inside">
          <li>US sizing is based on inches but excludes the width of the stitching.</li>
          <li>UK sizing starts from a slightly smaller base size than the US.</li>
          <li>EU sizing uses a linear scale in centimeters (called Paris Points).</li>
        </ul>
        <p>Understanding these differences is the first step to finding the perfect fit, especially when shopping online.</p>
        <h4>📏 2. How Shoe Sizes Are Measured</h4>
        <p>Every shoe size is derived from foot length — the distance from the back of your heel to the tip of your longest toe. Manufacturers design shoes slightly longer than the actual foot to provide comfort and space.</p>
        <p>Here’s a general idea:</p>
        <ul className="list-disc list-inside">
          <li>1 US shoe size ≈ 1/3 inch difference in foot length.</li>
          <li>1 EU size ≈ 2/3 cm difference.</li>
        </ul>
        <p>This means if your foot is 27 cm long, your EU size will be around 42–43, while your US size may be 9–9.5, depending on the brand.</p>
        <h4>🧦 3. How to Measure Your Foot Accurately</h4>
        <p>To get your exact shoe size, follow these simple steps:</p>
        <ol className="list-decimal list-inside">
          <li>Place a sheet of paper on the floor against a wall.</li>
          <li>Stand barefoot with your heel touching the wall.</li>
          <li>Mark the tip of your longest toe on the paper.</li>
          <li>Measure the distance between the wall and the mark using a ruler.</li>
          <li>Repeat for both feet — one foot is often slightly larger.</li>
        </ol>
        <p>Always choose your shoe size based on the larger foot measurement. For best results, measure your feet in the evening, as they tend to expand slightly throughout the day.</p>
        <h4>👠 4. Men’s vs. Women’s Shoe Sizes</h4>
        <p>Men’s and women’s shoe sizes differ in both length and width.</p>
        <p>For example:</p>
        <ul className="list-disc list-inside">
          <li>A men’s US 8 roughly equals a women’s US 9.5.</li>
          <li>Men’s shoes are generally wider in the heel and forefoot.</li>
        </ul>
        <p>If you’re switching between men’s and women’s shoes, simply add 1.5 to 2 sizes to convert. So, a men’s US 7 ≈ women’s US 8.5–9.</p>
        <h4>👧 5. Kids’ Shoe Sizes Explained</h4>
        <p>Kids’ shoe sizes can be especially confusing because they go through three major stages:</p>
        <ul className="list-disc list-inside">
          <li>Infant (0–12 months) – sizes 0 to 4</li>
          <li>Toddler (1–4 years) – sizes 4 to 10</li>
          <li>Little/Big Kids (4–12 years) – sizes 10.5 to 6</li>
        </ul>
        <p>Once your child outgrows size 6, they typically move to the adult size chart. Many brands also mark kids’ shoes with “K” or “Y” (for youth), like 3Y for youth size 3.</p>
        <h4>🌍 6. Global Shoe Size Comparison</h4>
        <p>Here’s a quick overview of how regions differ:</p>
        <Table>
          <TableHeader><TableRow><TableHead>Region</TableHead><TableHead>Example (Men’s)</TableHead><TableHead>Foot Length (cm)</TableHead></TableRow></TableHeader>
          <TableBody>
            <TableRow><TableCell>US</TableCell><TableCell>9</TableCell><TableCell>27.0 cm</TableCell></TableRow>
            <TableRow><TableCell>UK</TableCell><TableCell>8</TableCell><TableCell>26.4 cm</TableCell></TableRow>
            <TableRow><TableCell>EU</TableCell><TableCell>42.5</TableCell><TableCell>27.0 cm</TableCell></TableRow>
            <TableRow><TableCell>Japan</TableCell><TableCell>27.0</TableCell><TableCell>27.0 cm</TableCell></TableRow>
            <TableRow><TableCell>India</TableCell><TableCell>8</TableCell><TableCell>26.8 cm</TableCell></TableRow>
            <TableRow><TableCell>Australia</TableCell><TableCell>8</TableCell><TableCell>26.8 cm</TableCell></TableRow>
          </TableBody>
        </Table>
        <p>As you can see, EU and Japanese sizes often align more closely with actual foot length, making them easier for conversions.</p>
        <h4>⚙️ 7. Shoe Width – The Forgotten Factor</h4>
        <p>Length isn’t everything — width can completely change how a shoe fits. In the US system, width is indicated by letters:</p>
        <Table>
          <TableHeader><TableRow><TableHead>Width</TableHead><TableHead>Men’s</TableHead><TableHead>Women’s</TableHead></TableRow></TableHeader>
          <TableBody>
            <TableRow><TableCell>Narrow</TableCell><TableCell>B</TableCell><TableCell>AA</TableCell></TableRow>
            <TableRow><TableCell>Medium</TableCell><TableCell>D</TableCell><TableCell>B</TableCell></TableRow>
            <TableRow><TableCell>Wide</TableCell><TableCell>2E</TableCell><TableCell>D</TableCell></TableRow>
            <TableRow><TableCell>Extra Wide</TableCell><TableCell>4E</TableCell><TableCell>2E</TableCell></TableRow>
          </TableBody>
        </Table>
        <p>European and Asian brands rarely use letter widths, which is why some shoes may feel tight or loose even if the size number matches.</p>
        <h4>💡 8. Conversion Example (US to UK / EU)</h4>
        <p>Let’s take an example: If you wear a US Men’s 10, your equivalent sizes are roughly:</p>
        <ul className="list-disc list-inside">
          <li>UK: 9</li>
          <li>EU: 44</li>
          <li>CM: 28</li>
          <li>Japan: 28</li>
        </ul>
        <p>Similarly, a Women’s US 8 converts to:</p>
        <ul className="list-disc list-inside">
          <li>UK: 6</li>
          <li>EU: 39</li>
          <li>CM: 25</li>
        </ul>
        <p>Since brands have small variations, it’s always wise to check their official sizing charts before ordering.</p>
        <h4>📦 9. Why Sizes Differ Across Brands</h4>
        <p>Ever noticed that you fit a size 8 in Nike but 9 in Adidas? That’s because shoe size standards are not legally regulated in most countries. Each brand develops its own last (foot mold) — and that slight variation in shape can make shoes feel tighter or looser even if the size is the same.</p>
        <p><strong>Pro tip:</strong> If you’re shopping online, always look for the foot length in centimeters on the product page — it’s the most accurate universal measure.</p>
        <h4>👞 10. Shoe Size Conversion for Special Types</h4>
        <p>Certain types of shoes have their own sizing nuances:</p>
        <ul className="list-disc list-inside">
          <li>Running Shoes: Usually 0.5 size larger than casual shoes for toe movement.</li>
          <li>Formal Shoes: Fit tighter, so stick to true size.</li>
          <li>Heels: May require 0.5 size smaller for better grip.</li>
          <li>Boots: Consider thicker socks; half size up may be better.</li>
        </ul>
        <h4>🧠 11. Tips to Get the Perfect Fit Every Time</h4>
        <p>Here are a few universal tips:</p>
        <ul className="list-disc list-inside">
          <li>Always measure both feet and use the larger one.</li>
          <li>Try shoes in the evening for realistic size.</li>
          <li>Wear the same type of socks you’ll wear with those shoes.</li>
          <li>Leave half an inch of space in front of your toes.</li>
          <li>Don’t assume — always check brand-specific charts.</li>
        </ul>
        <h4>🧭 12. Quick Reference Conversion Table (Unisex)</h4>
        <Table>
          <TableHeader><TableRow><TableHead>US</TableHead><TableHead>UK</TableHead><TableHead>EU</TableHead><TableHead>CM</TableHead><TableHead>Inches</TableHead></TableRow></TableHeader>
          <TableBody>
            <TableRow><TableCell>5</TableCell><TableCell>4</TableCell><TableCell>37.5</TableCell><TableCell>23.5</TableCell><TableCell>9.25</TableCell></TableRow>
            <TableRow><TableCell>6</TableCell><TableCell>5</TableCell><TableCell>38.5</TableCell><TableCell>24.5</TableCell><TableCell>9.65</TableCell></TableRow>
            <TableRow><TableCell>7</TableCell><TableCell>6</TableCell><TableCell>40</TableCell><TableCell>25.4</TableCell><TableCell>10</TableCell></TableRow>
            <TableRow><TableCell>8</TableCell><TableCell>7</TableCell><TableCell>41</TableCell><TableCell>26.2</TableCell><TableCell>10.3</TableCell></TableRow>
            <TableRow><TableCell>9</TableCell><TableCell>8</TableCell><TableCell>42.5</TableCell><TableCell>27</TableCell><TableCell>10.6</TableCell></TableRow>
            <TableRow><TableCell>10</TableCell><TableCell>9</TableCell><TableCell>44</TableCell><TableCell>28</TableCell><TableCell>11</TableCell></TableRow>
            <TableRow><TableCell>11</TableCell><TableCell>10</TableCell><TableCell>45</TableCell><TableCell>28.9</TableCell><TableCell>11.4</TableCell></TableRow>
          </TableBody>
        </Table>
        <h4>📚 13. Frequently Asked Questions</h4>
        <p><strong>Q1. Is there a difference between US and Canadian shoe sizes?</strong><br/>No — US and Canadian shoe sizes are the same.</p>
        <p><strong>Q2. How do I convert my shoe size to centimeters?</strong><br/>Measure your foot in cm and refer to the EU or JP size. 1 cm roughly equals 1 JP size unit.</p>
        <p><strong>Q3. Are Indian sizes same as UK?</strong><br/>Indian shoe sizes are usually one size smaller than UK — but this varies by manufacturer.</p>
        <p><strong>Q4. Can I use a shoe size converter for kids and adults?</strong><br/>Yes! But make sure to choose the correct category — kids’ sizing restarts after size 6.</p>
        <h4>🌐 14. Final Thoughts</h4>
        <p>Finding your correct shoe size doesn’t have to be confusing. With a universal shoe size converter, you can easily compare measurements from any region — whether you’re buying from the US, UK, Japan, or Europe.</p>
        <p>Remember, the best way to ensure comfort is to know your exact foot length in centimeters — once you have that, conversions become simple.</p>
        <p>So, next time you shop online, use the Universal Shoe Size Converter above, check your measurements, and step into the perfect fit every time! 👣</p>
      </div>
    </div>
  );
}