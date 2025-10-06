
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';

const formSchema = z.object({
  gender: z.enum(['men', 'women']),
  unit: z.enum(['cm', 'inch']),
  chest: z.number().positive().optional(),
  waist: z.number().positive().optional(),
  bust: z.number().positive().optional(),
  hips: z.number().positive().optional(),
}).refine(data => {
    if (data.gender === 'men') {
        return data.chest !== undefined && data.waist !== undefined;
    }
    return data.bust !== undefined && data.waist !== undefined && data.hips !== undefined;
}, {
    message: "Please fill in all required measurements for the selected gender.",
    path: ['chest'], // Arbitrary path to display the message
});

type FormValues = z.infer<typeof formSchema>;

type Result = {
  shirtSizes: { US: number, UK: number, EU: number, India: number, Japan: number },
  pantsSizes: { US: number, UK: number, EU: number, India: number, Japan: number },
} | {
  topSizes: { US: number, UK: number, EU: number, India: number, Japan: number },
  bottomSizes: { US: number, UK: number, EU: number, India: number, Japan: number },
}

export default function BodyMeasurementToClothSizeConverter() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: 'men',
      unit: 'cm',
    },
  });

  const gender = form.watch('gender');

  const onSubmit = (values: FormValues) => {
    const { unit, gender } = values;

    const toInches = (value?: number) => {
        if (!value) return 0;
        return unit === 'cm' ? value / 2.54 : value;
    };

    if (gender === 'men') {
        let chest = toInches(values.chest);
        let waist = toInches(values.waist);

        let usShirt = Math.round(chest);
        usShirt = usShirt % 2 !== 0 ? usShirt + 1 : usShirt; // Round to nearest even number
        
        const pantsWaist = Math.round(waist);

        setResult({
            shirtSizes: { US: usShirt, UK: usShirt, EU: usShirt + 10, India: usShirt - 2, Japan: usShirt + 8 },
            pantsSizes: { US: pantsWaist, UK: pantsWaist, EU: Math.round(waist * 2.54 + 10), India: Math.round(waist * 2.54 - 2), Japan: Math.round(waist * 2.54 + 4) }
        });
    } else {
        let bust = toInches(values.bust);
        let waist = toInches(values.waist);

        let usTop = Math.round((bust - 32) * 1.5);
        usTop = usTop % 2 !== 0 ? usTop + 1 : usTop;

        let usBottom = Math.round(waist - 24);
        usBottom = usBottom % 2 !== 0 ? usBottom + 1 : usBottom;
        
        setResult({
            topSizes: { US: usTop, UK: usTop - 2, EU: usTop + 30, India: usTop + 26, Japan: usTop + 6 },
            bottomSizes: { US: usBottom, UK: usBottom - 2, EU: usBottom + 30, India: usBottom + 26, Japan: usBottom + 6 }
        });
    }
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Measurements</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="gender" render={({ field }) => (
                        <FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="men">Men</SelectItem><SelectItem value="women">Women</SelectItem></SelectContent></Select></FormItem>
                    )} />
                    <FormField control={form.control} name="unit" render={({ field }) => (
                        <FormItem><FormLabel>Unit</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="cm">Centimeters</SelectItem><SelectItem value="inch">Inches</SelectItem></SelectContent></Select></FormItem>
                    )} />
                </div>
                 {gender === 'men' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="chest" render={({ field }) => (<FormItem><FormLabel>Chest</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl></FormItem>)} />
                        <FormField control={form.control} name="waist" render={({ field }) => (<FormItem><FormLabel>Waist</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl></FormItem>)} />
                    </div>
                ) : (
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField control={form.control} name="bust" render={({ field }) => (<FormItem><FormLabel>Bust</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl></FormItem>)} />
                        <FormField control={form.control} name="waist" render={({ field }) => (<FormItem><FormLabel>Waist</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl></FormItem>)} />
                        <FormField control={form.control} name="hips" render={({ field }) => (<FormItem><FormLabel>Hips</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl></FormItem>)} />
                    </div>
                )}
                 {form.formState.errors.chest && <FormMessage>{form.formState.errors.chest.message}</FormMessage>}
            </CardContent>
          </Card>
          <Button type="submit">Convert</Button>
        </form>
      </Form>
      {result && 'shirtSizes' in result && (
          <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Shirt className="h-8 w-8 text-primary" /><CardTitle>Men's Estimated Sizes</CardTitle></div></CardHeader>
            <CardContent className="space-y-4">
                 <div>
                    <h3 className="font-semibold">Shirt Sizes</h3>
                    <p>US: {result.shirtSizes.US}, UK: {result.shirtSizes.UK}, EU: {result.shirtSizes.EU}, India: {result.shirtSizes.India}, Japan: {result.shirtSizes.Japan}</p>
                 </div>
                 <div>
                    <h3 className="font-semibold">Pants Sizes</h3>
                    <p>US: {result.pantsSizes.US}, UK: {result.pantsSizes.UK}, EU: {result.pantsSizes.EU}, India: {result.pantsSizes.India}, Japan: {result.pantsSizes.Japan}</p>
                 </div>
                 <CardDescription className='pt-2'>Note: These are approximations. Sizes vary greatly by brand and fit.</CardDescription>
            </CardContent>
          </Card>
      )}
       {result && 'topSizes' in result && (
          <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Shirt className="h-8 w-8 text-primary" /><CardTitle>Women's Estimated Sizes</CardTitle></div></CardHeader>
            <CardContent className="space-y-4">
                 <div>
                    <h3 className="font-semibold">Top / Dress Sizes</h3>
                    <p>US: {result.topSizes.US}, UK: {result.topSizes.UK}, EU: {result.topSizes.EU}, India: {result.topSizes.India}, Japan: {result.topSizes.Japan}</p>
                 </div>
                 <div>
                    <h3 className="font-semibold">Bottom / Skirt Sizes</h3>
                    <p>US: {result.bottomSizes.US}, UK: {result.bottomSizes.UK}, EU: {result.bottomSizes.EU}, India: {result.bottomSizes.India}, Japan: {result.bottomSizes.Japan}</p>
                 </div>
                 <CardDescription className='pt-2'>Note: These are approximations. Sizes vary greatly by brand and fit.</CardDescription>
            </CardContent>
          </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">This calculator uses simplified formulas to estimate clothing sizes based on body measurements. It converts all measurements to a base unit (inches) and then applies different calculations for men's and women's clothing to approximate sizes in various international systems. These are rough estimates, as brand sizing can vary significantly.</AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="space-y-4 prose prose-sm dark:prose-invert max-w-none">
        <h3 className='font-bold text-lg'>Body Measurement to Clothing Size Converter: Find Your Perfect Fit in US, UK, EU, India, and Japan</h3>
        <p className="text-sm">Finding clothes that fit perfectly can be a challenge, especially when shopping online or buying from international brands. Sizes vary widely across regions, and using the wrong size can result in discomfort, poor fit, and unnecessary returns. A body measurement to clothing size converter solves this problem by allowing you to determine the correct sizes for US, UK, EU, India, and Japan using your chest, bust, waist, and hip measurements.</p>
        <p className="text-sm">This guide explains how to measure your body accurately, understand size conversions for men and women, and make confident clothing purchases every time.</p>

        <h4 className='font-bold'>Why Body Measurements Matter</h4>
        <p className="text-sm">Relying on standard clothing sizes without considering your actual body measurements can cause:</p>
        <ul className="list-disc list-inside text-sm pl-4 space-y-1">
          <li>Shirts or tops that are too tight or loose.</li>
          <li>Pants or skirts that do not fit properly around the waist or hips.</li>
          <li>Reduced comfort and mobility.</li>
          <li>Increased likelihood of returns when shopping online.</li>
        </ul>
        <p className="text-sm">Using a body measurement to clothing size converter ensures your clothing fits comfortably and looks great, no matter the brand or country of origin.</p>

        <h4 className='font-bold'>How Clothing Sizes Work Across Different Regions</h4>
        <p className="text-sm">Clothing sizes differ based on the country or region:</p>
        <ul className="list-disc list-inside text-sm pl-4 space-y-1">
          <li><strong>US Sizes:</strong> Typically based on chest/bust, waist, and hips in inches.</li>
          <li><strong>UK Sizes:</strong> Slightly smaller than US sizes; conversion is often US size minus 2.</li>
          <li><strong>EU Sizes:</strong> Measured in centimeters; usually US size plus 10 (men) or plus 30 (women).</li>
          <li><strong>India Sizes:</strong> Often derived from EU sizes with slight adjustments.</li>
          <li><strong>Japan Sizes:</strong> Slightly smaller than US sizes; often US size plus 6-8 depending on gender.</li>
        </ul>
        <p className="text-sm">A converter makes these differences easy to navigate, so you can confidently shop internationally.</p>

        <h4 className='font-bold'>How to Measure Your Body Accurately</h4>
        <p className="text-sm">Accurate measurements are essential for selecting the right clothing size:</p>
        <h5 className="font-semibold text-sm">For Men</h5>
        <ul className="list-disc list-inside text-sm pl-4 space-y-1">
          <li><strong>Chest:</strong> Measure around the fullest part of your chest, under your arms.</li>
          <li><strong>Waist:</strong> Measure around your natural waistline, above your hips.</li>
          <li><strong>Optional:</strong> Height, for shirts or pants length.</li>
        </ul>
        <h5 className="font-semibold text-sm mt-2">For Women</h5>
        <ul className="list-disc list-inside text-sm pl-4 space-y-1">
          <li><strong>Bust:</strong> Measure around the fullest part of your bust.</li>
          <li><strong>Waist:</strong> Measure around your natural waistline.</li>
          <li><strong>Hips:</strong> Measure around the fullest part of your hips.</li>
          <li><strong>Optional:</strong> Height, for dresses or pants length.</li>
        </ul>
        <p className="text-sm mt-2">Always measure in centimeters or inches using a soft measuring tape, and ensure the tape is snug but not tight.</p>

        <h4 className='font-bold'>Using a Body Measurement to Clothing Size Converter</h4>
        <p className="text-sm">A converter makes it simple:</p>
        <ol className="list-decimal list-inside text-sm pl-4 space-y-1">
          <li>Select gender: Men or Women.</li>
          <li>Choose unit of measurement: Centimeters or inches.</li>
          <li>Enter your measurements: Chest/bust, waist, hips.</li>
          <li>Get your sizes: The calculator will provide your US, UK, EU, India, and Japan sizes for tops/shirts and bottoms/pants.</li>
        </ol>
        <p className="text-sm">This eliminates guesswork, especially when shopping online or internationally.</p>

        <h4 className='font-bold'>Approximate Clothing Size Conversion Charts</h4>
        <h5 className="font-semibold text-sm">Men’s Shirts / Tops</h5>
        <Table><TableHeader><TableRow><TableHead>Chest (inches)</TableHead><TableHead>US</TableHead><TableHead>UK</TableHead><TableHead>EU</TableHead><TableHead>India</TableHead><TableHead>Japan</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>36</TableCell><TableCell>36</TableCell><TableCell>36</TableCell><TableCell>46</TableCell><TableCell>34</TableCell><TableCell>44</TableCell></TableRow><TableRow><TableCell>38</TableCell><TableCell>38</TableCell><TableCell>38</TableCell><TableCell>48</TableCell><TableCell>36</TableCell><TableCell>46</TableCell></TableRow><TableRow><TableCell>40</TableCell><TableCell>40</TableCell><TableCell>40</TableCell><TableCell>50</TableCell><TableCell>38</TableCell><TableCell>48</TableCell></TableRow><TableRow><TableCell>42</TableCell><TableCell>42</TableCell><TableCell>42</TableCell><TableCell>52</TableCell><TableCell>40</TableCell><TableCell>50</TableCell></TableRow><TableRow><TableCell>44</TableCell><TableCell>44</TableCell><TableCell>44</TableCell><TableCell>54</TableCell><TableCell>42</TableCell><TableCell>52</TableCell></TableRow></TableBody></Table>
        <h5 className="font-semibold text-sm mt-2">Men’s Pants / Trousers</h5>
        <Table><TableHeader><TableRow><TableHead>Waist (inches)</TableHead><TableHead>US</TableHead><TableHead>UK</TableHead><TableHead>EU (cm)</TableHead><TableHead>India (cm)</TableHead><TableHead>Japan (cm)</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>30</TableCell><TableCell>30</TableCell><TableCell>30</TableCell><TableCell>86</TableCell><TableCell>76</TableCell><TableCell>90</TableCell></TableRow><TableRow><TableCell>32</TableCell><TableCell>32</TableCell><TableCell>32</TableCell><TableCell>91</TableCell><TableCell>81</TableCell><TableCell>95</TableCell></TableRow><TableRow><TableCell>34</TableCell><TableCell>34</TableCell><TableCell>34</TableCell><TableCell>96</TableCell><TableCell>86</TableCell><TableCell>100</TableCell></TableRow><TableRow><TableCell>36</TableCell><TableCell>36</TableCell><TableCell>36</TableCell><TableCell>101</TableCell><TableCell>91</TableCell><TableCell>105</TableCell></TableRow></TableBody></Table>
        <h5 className="font-semibold text-sm mt-2">Women’s Tops / Dresses</h5>
        <Table><TableHeader><TableRow><TableHead>Bust (inches)</TableHead><TableHead>US</TableHead><TableHead>UK</TableHead><TableHead>EU</TableHead><TableHead>India</TableHead><TableHead>Japan</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>32</TableCell><TableCell>32</TableCell><TableCell>30</TableCell><TableCell>62</TableCell><TableCell>58</TableCell><TableCell>38</TableCell></TableRow><TableRow><TableCell>34</TableCell><TableCell>34</TableCell><TableCell>32</TableCell><TableCell>64</TableCell><TableCell>60</TableCell><TableCell>40</TableCell></TableRow><TableRow><TableCell>36</TableCell><TableCell>36</TableCell><TableCell>34</TableCell><TableCell>66</TableCell><TableCell>62</TableCell><TableCell>42</TableCell></TableRow><TableRow><TableCell>38</TableCell><TableCell>38</TableCell><TableCell>36</TableCell><TableCell>68</TableCell><TableCell>64</TableCell><TableCell>44</TableCell></TableRow></TableBody></Table>
        <h5 className="font-semibold text-sm mt-2">Women’s Bottoms / Skirts / Pants</h5>
        <Table><TableHeader><TableRow><TableHead>Waist (inches)</TableHead><TableHead>US</TableHead><TableHead>UK</TableHead><TableHead>EU</TableHead><TableHead>India</TableHead><TableHead>Japan</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>24</TableCell><TableCell>0</TableCell><TableCell>0</TableCell><TableCell>30</TableCell><TableCell>26</TableCell><TableCell>6</TableCell></TableRow><TableRow><TableCell>26</TableCell><TableCell>2</TableCell><TableCell>2</TableCell><TableCell>32</TableCell><TableCell>28</TableCell><TableCell>8</TableCell></TableRow><TableRow><TableCell>28</TableCell><TableCell>4</TableCell><TableCell>4</TableCell><TableCell>34</TableCell><TableCell>30</TableCell><TableCell>10</TableCell></TableRow><TableRow><TableCell>30</TableCell><TableCell>6</TableCell><TableCell>6</TableCell><TableCell>36</TableCell><TableCell>32</TableCell><TableCell>12</TableCell></TableRow></TableBody></Table>
        <p className="text-xs">Note: These are approximate sizes; brand-specific variations may exist.</p>

        <h4 className='font-bold'>Tips for Choosing the Right Clothing Size</h4>
        <ul className="list-disc list-inside text-sm pl-4 space-y-1">
          <li><strong>Measure both sides:</strong> One side of your body may be slightly larger. Use the larger measurement.</li>
          <li><strong>Consider fabric and stretch:</strong> Some materials are more forgiving than others.</li>
          <li><strong>Allow room for comfort:</strong> Clothes should fit snugly but allow easy movement.</li>
          <li><strong>Use the converter for international brands:</strong> Sizes vary across regions.</li>
          <li><strong>Check brand-specific size charts:</strong> Always confirm for online purchases.</li>
        </ul>

        <h4 className='font-bold'>Common Mistakes to Avoid</h4>
        <ul className="list-disc list-inside text-sm pl-4 space-y-1">
          <li>Relying only on “usual size”: Your normal size may not fit every brand or country.</li>
          <li>Ignoring regional conversions: US, UK, EU, India, and Japan sizes differ.</li>
          <li>Not measuring hips or waist for bottoms: Skipping measurements can lead to poor fit.</li>
          <li>Forgetting material stretch: Tight-fitting fabrics may require sizing up.</li>
        </ul>

        <h4 className='font-bold'>Benefits of Using a Body Measurement to Clothing Size Converter</h4>
        <ul className="list-disc list-inside text-sm pl-4 space-y-1">
            <li>Provides accurate sizes for multiple regions.</li>
            <li>Reduces returns and exchanges from online shopping.</li>
            <li>Ensures comfort and proper fit for every garment.</li>
            <li>Ideal for international shopping, gifts, and special occasions.</li>
        </ul>

        <h4 className='font-bold'>FAQ</h4>
        <p className="text-sm"><strong>Q1: Can I use the same size for all brands?</strong><br/>No. Sizes vary by brand; always check brand-specific size charts.</p>
        <p className="text-sm"><strong>Q2: Should I round up or down?</strong><br/>Round to the nearest practical size. When in doubt, choose slightly larger for comfort.</p>
        <p className="text-sm"><strong>Q3: Do men and women converters differ?</strong><br/>Yes. Men’s sizes are based on chest/waist; women’s sizes include bust, waist, and hips.</p>
        <p className="text-sm"><strong>Q4: Can I use this converter for kids or plus sizes?</strong><br/>This converter is designed for adult sizes; children and specialty sizes may need separate charts.</p>

        <h4 className='font-bold'>Conclusion</h4>
        <p className="text-sm">A body measurement to clothing size converter simplifies shopping by providing accurate sizes for US, UK, EU, India, and Japan. By measuring your chest/bust, waist, and hips correctly and using this tool, you can confidently purchase clothes that fit perfectly.</p>
        <p className="text-sm">Properly fitting clothing improves comfort, appearance, and confidence, whether you are buying casual wear, formal attire, or athletic apparel. Always measure, check the converter, and consult brand-specific charts for the best results.</p>
      
        <h4 className='font-bold'>🔗 Related Calculators</h4>
        <ul className="list-disc list-inside text-sm space-y-1 pl-4">
            <li><Link href="/category/conversions/shoe-size-converter" className="text-primary underline">👟 Universal Shoe Size Converter</Link></li>
            <li><Link href="/category/conversions/ring-size-converter" className="text-primary underline">💍 Ring Size Converter</Link></li>
            <li><Link href="/category/conversions/hat-size-converter" className="text-primary underline">🧢 Hat Size Converter</Link></li>
            <li><Link href="/category/conversions/belt-size-converter" className="text-primary underline">👖 Belt Size Converter</Link></li>
            <li><Link href="/category/conversions/glove-size-converter" className="text-primary underline">🧤 Glove Size Converter</Link></li>
        </ul>
      </div>
    </div>
  );
}
