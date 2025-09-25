
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileImage } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  bpp: z.number().positive(),
  compressionRatio: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ImageCompressionSizeCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        width: undefined,
        height: undefined,
        bpp: 24, // 24 bits per pixel (True Color)
        compressionRatio: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { width, height, bpp, compressionRatio } = values;
    
    const uncompressedSizeBits = width * height * bpp;
    const compressedSizeBits = uncompressedSizeBits / compressionRatio;
    const compressedSizeBytes = compressedSizeBits / 8;
    const compressedSizeMB = compressedSizeBytes / 1024 / 1024;
    
    setResult(compressedSizeMB);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>Estimate the final file size of a compressed image.</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="width" render={({ field }) => (
                <FormItem><FormLabel>Image Width (pixels)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => e.target.value === '' ? field.onChange(undefined) : field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="height" render={({ field }) => (
                <FormItem><FormLabel>Image Height (pixels)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => e.target.value === '' ? field.onChange(undefined) : field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="bpp" render={({ field }) => (
                <FormItem><FormLabel>Bits Per Pixel (BPP)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => e.target.value === '' ? field.onChange(undefined) : field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="compressionRatio" render={({ field }) => (
                <FormItem><FormLabel>Compression Ratio (e.g., 10 for 10:1)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => e.target.value === '' ? field.onChange(undefined) : field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Estimate Size</Button>
        </form>
      </Form>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><FileImage className="h-8 w-8 text-primary" /><CardTitle>Estimated Compressed Size</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result.toFixed(2)} MB</p>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Image Width/Height (pixels)</h4>
                    <p>The dimensions of the image in pixels.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Bits Per Pixel (BPP)</h4>
                    <p>The number of bits used to represent the color of a single pixel. Common values are 8 (grayscale), 24 (true color), or 32 (true color with alpha/transparency).</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Compression Ratio</h4>
                    <p>How much smaller the compressed image is compared to the original. A 10:1 ratio means the compressed file is 10 times smaller than the uncompressed data.</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                It first calculates the uncompressed size of the image by multiplying its dimensions (width x height) by the color depth (bits per pixel). It then divides this raw size by the compression ratio to estimate the final file size, which is then converted from bits to megabytes.
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
