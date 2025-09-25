
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DownloadCloud } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  fileSize: z.number().positive(),
  fileUnit: z.enum(['MB', 'GB', 'TB']),
  speed: z.number().positive(),
  speedUnit: z.enum(['Mbps', 'Gbps']),
});

type FormValues = z.infer<typeof formSchema>;

function formatDuration(totalSeconds: number) {
    if (totalSeconds < 60) return `${Math.round(totalSeconds)} seconds`;
    if (totalSeconds < 3600) return `${Math.round(totalSeconds / 60)} minutes`;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.round((totalSeconds % 3600) / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} and ${minutes} minute${minutes > 1 ? 's' : ''}`;
}

export default function DownloadTimeCalculator() {
  const [result, setResult] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        fileSize: undefined,
        fileUnit: 'GB',
        speed: undefined,
        speedUnit: 'Mbps',
    },
  });

  const onSubmit = (values: FormValues) => {
    let { fileSize, fileUnit, speed, speedUnit } = values;

    // Convert file size to Megabits
    if (fileUnit === 'GB') fileSize *= 1000;
    if (fileUnit === 'TB') fileSize *= 1000000;
    const sizeInMegabits = fileSize * 8;

    // Convert speed to Mbps
    if (speedUnit === 'Gbps') speed *= 1000;

    const totalSeconds = sizeInMegabits / speed;
    setResult(formatDuration(totalSeconds));
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="fileSize" render={({ field }) => (
                <FormItem><FormLabel>File Size</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => e.target.value === '' ? field.onChange(undefined) : field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="fileUnit" render={({ field }) => (
                <FormItem><FormLabel>File Size Unit</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="MB">Megabytes (MB)</option>
                    <option value="GB">Gigabytes (GB)</option>
                    <option value="TB">Terabytes (TB)</option>
                </select>
                </FormItem>
            )} />
            <FormField control={form.control} name="speed" render={({ field }) => (
                <FormItem><FormLabel>Internet Speed</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => e.target.value === '' ? field.onChange(undefined) : field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="speedUnit" render={({ field }) => (
                <FormItem><FormLabel>Speed Unit</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="Mbps">Megabits/sec (Mbps)</option>
                    <option value="Gbps">Gigabits/sec (Gbps)</option>
                </select>
                </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Time</Button>
        </form>
      </Form>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><DownloadCloud className="h-8 w-8 text-primary" /><CardTitle>Estimated Download Time</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result}</p>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">File Size & Unit</h4>
                    <p>The size of the file you are downloading (e.g., 10 GB).</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Internet Speed & Unit</h4>
                    <p>The speed of your internet connection, as advertised by your provider or measured by a speed test (e.g., 100 Mbps).</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works (Bits vs. Bytes)</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>The key to this calculation is the difference between bits and bytes. There are 8 bits in 1 byte.</p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                    <li>File sizes are measured in <strong>MegaBytes (MB)</strong> or <strong>GigaBytes (GB)</strong>.</li>
                    <li>Internet speeds are measured in <strong>Megabits per second (Mbps)</strong> or <strong>Gigabits per second (Gbps)</strong>.</li>
                </ul>
                <p className="mt-2">The calculator converts your file size into Megabits and your internet speed into Megabits per second. It then divides the file size by the speed to determine the total download time in seconds, which is then formatted into a more readable format.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
